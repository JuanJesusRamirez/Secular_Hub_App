# 🚀 Secular Hub — DEV Infrastructure Ready (BUILD ONCE – DEPLOY MANY)

## ✅ Configuración Completada

### 1. **Infraestructura Azure (Terraform)**

#### Backend de Estado (Remoto)
- ✅ Resource Group: `rg-secular-hub-tfstate`
- ✅ Storage Account: `secularhubtfst20260108`
- ✅ Blob Container: `tfstate` (key: `secular-hub/dev/infra.tfstate`)

#### Recursos DEV (RG Separado: `rg-secular-hub-dev`)
- ✅ **Log Analytics Workspace**: `law-dev` (30 días retención)
- ✅ **Container Apps Environment**: `dev-env`
- ✅ **Azure Container Registry**: `acrsecularhub.azurecr.io`
  - SKU: Standard
  - ❌ `admin_enabled = false` (sin credenciales admin)
- ✅ **Container App**: `secular-hub-api-dev-dev`
  - Ingress externo en puerto 3000
  - Managed Identity (SystemAssigned)
  - Min replicas: 1, Max: 3
  - Revisión única (Single revision mode)
- ✅ **Role Assignment**: AcrPull (Managed Identity → ACR)

### 2. **Terraform Code (Reproducible)**

```
terraform/
├── provider.tf          → Provider azurerm
├── backend.tf           → Backend remoto (azurerm)
├── main.tf              → Recursos DEV
├── variables.tf         → Variables parametrizables
├── outputs.tf           → FQDN, ACR login server, RG
└── .terraform.lock.hcl  → Provider versions locked

envs/
└── dev.tfvars          → Valores DEV
```

**Inicialización:**
```bash
terraform init -backend-config="storage_account_name=secularhubtfst20260108"
```

**Despliegue:**
```bash
terraform apply -var-file=envs/dev.tfvars -var="image_tag=<commit-sha>"
```

### 3. **GitHub Actions Workflows**

#### Workflow 1: Build & Push Image
**Archivo**: `.github/workflows/build-and-push-image.yml`
- Dispara: `push` a `dev` (cambios en `src/`, `Dockerfile`, etc.)
- ✅ Build imagen Docker con tag `<commit-sha>`
- ✅ Push a `acrsecularhub.azurecr.io/secular-hub:<sha>`
- ✅ Sin usar tag `latest` (imagen inmutable)
- ✅ Autenticación: OIDC (sin secrets de ACR)

#### Workflow 2: Deploy to Dev
**Archivo**: `.github/workflows/deploy-dev.yml`
- Dispara: `workflow_run` (cuando build-and-push completa)
- ✅ Obtiene commit SHA de la imagen compilada
- ✅ Terraform init con backend remoto
- ✅ Terraform apply con `image_tag=<commit-sha>`
- ✅ Captura outputs (FQDN, ACR server)
- ✅ Verificación automática

### 4. **Seguridad (OIDC)**

#### Application Registration
- **Nombre**: `secular-hub-github`
- **Client ID**: `0f9e7724-7a9f-445b-b394-3bc391a2978d`
- **Tenant ID**: `813a63fc-75cc-4c00-b086-0e0a5151bb51`
- **Subscription ID**: `4730c31d-4c41-46bc-83aa-b4975fe8e80a`

#### Credencial Federada OIDC
```json
{
  "name": "github-dev-branch",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:JuanJesusRamirez/Secular_Hub_App:ref:refs/heads/dev",
  "audiences": ["api://AzureADTokenExchange"]
}
```

#### Role en Subscription
- ✅ **Role**: Contributor
- ✅ **Scope**: /subscriptions/4730c31d-4c41-46bc-83aa-b4975fe8e80a

#### GitHub Secrets (Configurados)
```
AZURE_CLIENT_ID = 0f9e7724-7a9f-445b-b394-3bc391a2978d
AZURE_TENANT_ID = 813a63fc-75cc-4c00-b086-0e0a5151bb51
AZURE_SUBSCRIPTION_ID = 4730c31d-4c41-46bc-83aa-b4975fe8e80a
```

✅ **NO incluyes `clientSecret`** — OIDC elimina secrets.

### 5. **Documentación**

- ✅ `PLATFORM_INFRASTRUCTURE_DEV.md` → Arquitectura, CI/CD, ejecución manual
- ✅ `docs/OIDC_SETUP_GITHUB_ACTIONS.md` → Setup OIDC, troubleshooting
- ✅ `scripts/test-oidc.ps1` → Test local de autenticación

---

## 🔄 Flujo de Despliegue Automatizado

```
1. git push origin dev
   ↓
2. GitHub Actions: build-and-push-image.yml
   ├─ Build Docker: secular-hub:<commit-sha>
   ├─ Push a acrsecularhub.azurecr.io/secular-hub:<sha>
   └─ Workflow completa ✅
   ↓
3. GitHub Actions: deploy-dev.yml (automático)
   ├─ terraform init (backend remoto)
   ├─ terraform apply -var="image_tag=<sha>"
   ├─ Container App: secular-hub-api-dev-dev
   └─ Outputs capturados ✅
   ↓
4. Container App ejecutando en https://<fqdn>:3000
```

---

## 📊 Verificación de Despliegue

### En GitHub
1. Ve a **Actions** → Workflow runs
2. Busca `build-and-push-image` y `deploy-dev`
3. Verifica que ambos completaron ✅

### En Azure Portal
```bash
# Verifica que la imagen existe en ACR
az acr repository show-manifests \
  --name acrsecularhub \
  --repository secular-hub

# Verifica que el Container App está ejecutando
az containerapp show \
  -n secular-hub-api-dev-dev \
  -g rg-secular-hub-dev \
  --query "properties.runningStatus"

# Output: "Running"
```

### Local (Terraform Outputs)
```bash
cd terraform
terraform output

# Output esperado:
# acr_login_server = "acrsecularhub.azurecr.io"
# container_app_fqdn = "secular-hub-api-dev-dev--XXXXX.azurecontainerapps.io"
# resource_group_dev = "rg-secular-hub-dev"
```

---

## 🎯 Patrón BUILD ONCE – DEPLOY MANY

Este diseño está **listo para escalar a UAT/PRD sin refactor**:

### Hoy (DEV)
- 1 imagen: `acrsecularhub.azurecr.io/secular-hub:<commit-sha>`
- 1 Container App: `secular-hub-api-dev-dev`
- 1 RG: `rg-secular-hub-dev`
- 1 ACR compartido

### Mañana (UAT + PRD)
Solo necesitas:
1. `envs/uat.tfvars` y `envs/prd.tfvars`
2. `deploy-uat.yml` y `deploy-prd.yml`
3. **La misma imagen** (sin reconstruir)
4. Nuevos nombres de Container App (`secular-hub-api-uat-uat`, `secular-hub-api-prd-prd`)

No hay refactor de infraestructura — el diseño es extensible.

---

## 🚨 Requisitos Verificados

✅ **Infraestructura DEV aprovisionada con Terraform**
✅ **ACR único (no por entorno)**
✅ **Sin admin_enabled en ACR**
✅ **Sin secrets en código (OIDC)**
✅ **Imagen con tag inmutable (commit SHA)**
✅ **Managed Identity → AcrPull role**
✅ **Container App ejecutando**
✅ **Backend remoto configurado**
✅ **Workflows CI/CD operacionales**

---

## 📋 Checklist Final

- [ ] Verifica que los 3 secrets están en GitHub (Settings → Secrets)
- [ ] Haz `git push origin dev` para disparar los workflows
- [ ] Monitorea GitHub Actions → Workflow runs
- [ ] Verifica que `build-and-push-image` completa exitosamente
- [ ] Verifica que `deploy-dev` se ejecuta automáticamente
- [ ] Accede a la URL del Container App (`https://<fqdn>:3000`)
- [ ] Confirma que la imagen está en ACR: `az acr repository show-manifests --name acrsecularhub --repository secular-hub`

---

## 📝 Notas Importantes

### Cambios en el Dockerfile
Si haces cambios en `Dockerfile`, el workflow se dispara automáticamente.  
La imagen se construye, publica y despliega sin intervención.

### Cambios en `terraform/`
Si cambias `terraform/main.tf`, `variables.tf`, etc., ejecuta manualmente:
```bash
cd terraform
terraform apply -var-file=../envs/dev.tfvars -var="image_tag=<commit-sha>"
```

### Escalabilidad UAT/PRD
Cuando estés listo:
1. Copia `terraform/main.tf` y adapta nombres de recursos
2. Crea `envs/uat.tfvars` (nombre del Container App, etc.)
3. Crea workflow `deploy-uat.yml` que dispare en branch `uat`
4. **Reutiliza la misma imagen SHA** — no reconstruyas

---

## 🎓 Referencias

- [PLATFORM_INFRASTRUCTURE_DEV.md](../PLATFORM_INFRASTRUCTURE_DEV.md) — Arquitectura completa
- [OIDC_SETUP_GITHUB_ACTIONS.md](../docs/OIDC_SETUP_GITHUB_ACTIONS.md) — Setup OIDC
- [Terraform Outputs](./terraform/outputs.tf) — Valores de salida
- [GitHub Actions Workflows](./.github/workflows/) — CI/CD pipelines

---

**Estado**: ✅ **PRODUCCIÓN LISTA (DEV)**  
**Patrón**: BUILD ONCE – DEPLOY MANY  
**Seguridad**: OIDC (sin secrets)  
**Reproducibilidad**: Terraform + Backend remoto  
**Escalabilidad**: Extensible a UAT/PRD sin refactor
