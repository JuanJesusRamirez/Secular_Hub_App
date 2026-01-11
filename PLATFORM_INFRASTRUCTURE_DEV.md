# Secular Hub — Platform Infrastructure (DEV)

## Arquitectura

Implementamos el patrón **BUILD ONCE – DEPLOY MANY** con los siguientes componentes:

### 1. Backend Terraform (Estado Remoto)
- **Resource Group**: `rg-secular-hub-tfstate`
- **Storage Account**: `secularhubtfst20260108`
- **Blob Container**: `tfstate` con key `secular-hub/dev/infra.tfstate`
- Garantiza reproducibilidad y evita state local.

### 2. Recursos DEV (RG Separado)
- **Resource Group**: `rg-secular-hub-dev`
- **Log Analytics Workspace**: `law-dev` (30 días de retención)
- **Container Apps Environment**: `cae-secular-hub-api-dev`
- **Azure Container Registry (ACR)**: `acrsecularhubshared.azurecr.io` (UN SOLO ACR para todo el proyecto)
  - SKU: Standard
  - `admin_enabled = false` (sin admin credentials)
- **Container App**: `ca-secular-hub-api-dev`
  - Ingress externo habilitado en puerto 3000
  - Managed Identity (SystemAssigned)
  - Revisión única (Single revision mode)
  - Min/Max replicas: 1–3

### 3. Seguridad
- ✅ **Sin secrets en el código** (ACR credentials via OIDC)
- ✅ **ACR sin admin** (solo AcrPull role via Managed Identity)
- ✅ **OIDC** para autenticación de GitHub Actions → Azure
- ✅ Imagen Docker con **tag inmutable** (commit SHA, nunca `latest`)

---

## Flujo de Despliegue (CI/CD)

### 1. Build & Push Image
**Workflow**: `.github/workflows/build-and-push-image.yml`
- Dispara en: `push` a `dev` (cambios en `src/`, `Dockerfile`, etc.)
- Acciones:
  1. Login a Azure via OIDC
  2. Build imagen Docker con tag `<commit-sha>`
  3. Push a `acrsecularhubshared.azurecr.io/secular-hub:<commit-sha>`
  4. Verifica imagen en ACR

**Output**: `image_tag = <commit-sha>`

### 2. Deploy to Dev
**Workflow**: `.github/workflows/deploy-dev.yml`
- Dispara en: `workflow_run` (cuando `build-and-push-image.yml` completa)
- Acciones:
  1. Obtiene commit SHA de la imagen compilada
  2. Login a Azure via OIDC
  3. `terraform init -backend-config=...`
  4. `terraform plan -var="image_tag=<commit-sha>"`
  5. `terraform apply` automático
  6. Captura outputs (FQDN del Container App, ACR login server)

---

## Estructura de Archivos

```
terraform/
├── provider.tf           # Configuración de provider azurerm
├── backend.tf            # Backend remoto (azurerm)
├── main.tf              # Recursos: RG, LAW, ACR, Container App, role assignments
├── variables.tf         # Variables: env, location, acr_name, image_tag, etc.
├── outputs.tf           # Outputs: FQDN, ACR login server, RG name
└── .terraform.lock.hcl  # Versiones de providers

envs/
└── dev.tfvars          # Valores DEV: region, nombres, env=dev

.github/workflows/
├── build-and-push-image.yml  # Build Docker image, push a ACR
└── deploy-dev.yml            # Deploy con Terraform
```

---

## Ejecución Manual (Local)

Si necesitas ejecutar Terraform localmente:

### 1. Prerequisitos
```powershell
# Instala Terraform >= 1.5.7
terraform version

# Login a Azure
az login

# Obtén tu subscription ID
$SUBSCRIPTION_ID = az account show --query id -o tsv
```

### 2. Inicializar Backend
```powershell
cd terraform

terraform init `
  -backend-config="storage_account_name=secularhubtfst20260108" `
  -backend-config="resource_group_name=rg-secular-hub-tfstate" `
  -backend-config="container_name=tfstate" `
  -reconfigure
```

### 3. Plan & Apply
```powershell
# Obtén el commit SHA actual
$COMMIT_SHA = git rev-parse --short HEAD

# Plan
terraform plan `
  -var-file="../envs/dev.tfvars" `
  -var="image_tag=$COMMIT_SHA"

# Apply
terraform apply `
  -var-file="../envs/dev.tfvars" `
  -var="image_tag=$COMMIT_SHA" `
  -auto-approve
```

### 4. Verificar Despliegue
```powershell
# Obtén los outputs
terraform output

# Output esperado:
# acr_login_server = "acrsecularhubshared.azurecr.io"
# container_app_fqdn = "secular-hub-api-dev-dev--XXXXX.azurecontainerapps.io"
# resource_group_dev = "rg-secular-hub-dev"

# Verifica que el Container App responda (puerto 3000)
curl https://<container_app_fqdn>:3000
```

---

## Variables de Entorno Requeridas

Para que el workflow de GitHub Actions funcione, necesitas configurar estos **secrets**:

- `AZURE_CLIENT_ID`: Client ID de la Managed Identity / Application Registration
- `AZURE_TENANT_ID`: Tenant ID de Azure AD
- `AZURE_SUBSCRIPTION_ID`: Subscription ID

**Nota**: No usamos `ACR_USERNAME`, `ACR_PASSWORD`, ni `ARM_CLIENT_SECRET`.  
El workflow usa **OIDC + `az acr login`** para evitar secrets.

---

## Patrón BUILD ONCE – DEPLOY MANY

Este diseño permite escalar a **UAT y PRD sin refactor**:

1. **La misma imagen Docker** (tag con commit SHA) se promociona a través de entornos.
2. Cada entorno (DEV, UAT, PRD) tendrá su propio:
   - Resource Group separado
   - Container App separado (p.ej., `secular-hub-api-uat-uat`, `secular-hub-api-prd-prd`)
   - Terraform state separado (key: `secular-hub/uat/infra.tfstate`, etc.)
3. El ACR es **compartido** (un solo `acrsecularhubshared.azurecr.io`).
4. Los workflows simplemente varían el `image_tag` y el `environment` (DEV/UAT/PRD).

---

## Próximos Pasos (UAT/PRD)

Cuando estés listo para agregar UAT/PRD:

1. Crea archivos `envs/uat.tfvars` y `envs/prd.tfvars`
2. Crea workflows `deploy-uat.yml` y `deploy-prd.yml`
3. Replica el `terraform/main.tf` con pequeñas variaciones (nombres de recursos)
4. Usa **la misma imagen SHA** — no reconstruyas.

---

## Validaciones de Seguridad

✅ **No hay secrets expuestos**:
- ACR login: OIDC + `az acr login`
- Azure auth: Managed Identity vía OIDC

✅ **ACR seguro**:
- `admin_enabled = false`
- AcrPull role asignado vía role_assignment

✅ **Imagen inmutable**:
- Tag: `<commit-sha>` (nunca `latest`)
- Trazabilidad completa

✅ **State remoto**:
- Almacenado en Storage Account con autenticación Azure
- Locked durante apply

---

## Troubleshooting

### Error: `AZURE_CLIENT_ID not found`
Verifica que los secrets de GitHub están configurados en Settings → Secrets.

### Error: `terraform init: storage account not found`
Confirma que existen `rg-secular-hub-tfstate` y `secularhubtfst20260108`:
```bash
az group show -n rg-secular-hub-tfstate
az storage account show -n secularhubtfst20260108 -g rg-secular-hub-tfstate
```

### Error: `AcrPull role assignment failed`
Asegúrate que la Managed Identity del Container App existe antes de asignar el role.

---

## Referencias

- [Azure Container Apps Terraform Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/container_app)
- [OIDC with GitHub Actions](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Azure Container Registry Security](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-authentication)
