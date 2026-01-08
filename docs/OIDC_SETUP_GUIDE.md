# Guía Completa: Configurar OIDC en GitHub Actions para Azure Deployment

## 📋 Tabla de Contenidos
1. [¿Qué es OIDC?](#qué-es-oidc)
2. [Por qué usar OIDC](#por-qué-usar-oidc)
3. [Comparativa de métodos](#comparativa-de-métodos)
4. [Configuración paso a paso](#configuración-paso-a-paso)
5. [Verificación](#verificación)
6. [Troubleshooting](#troubleshooting)
7. [Referencias](#referencias)

---

## 🔐 ¿Qué es OIDC?

**OIDC (OpenID Connect)** es un protocolo de autenticación que permite a GitHub Actions autenticarse directamente con Azure AD sin necesidad de guardar credenciales (contraseñas) en GitHub.

### Flujo OIDC:

```
┌─────────────────────────────────────────────────────────┐
│ 1. GITHUB ACTIONS ejecuta tu workflow                   │
│    └─ Genera un JWT Token temporal automáticamente      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. TOKEN JWT contiene:                                  │
│    ├─ issuer: https://token.actions.githubusercontent  │
│    ├─ subject: repo:owner/repo:ref:refs/heads/main    │
│    ├─ exp: 1 hora (expira automáticamente)            │
│    └─ audience: api://AzureADTokenExchange             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Azure AD valida el token:                            │
│    ✓ ¿Es de GitHub? ✓ ¿Es del repo correcto?          │
│    ✓ ¿No está expirado? ✓ ¿Tiene acceso?              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Azure emite un Access Token válido por 1 hora       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Terraform/Azure CLI usan el Access Token            │
│    para desplegar recursos                              │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Por qué usar OIDC

| Aspecto | Service Principal Secret | OIDC |
|--------|--------------------------|------|
| **Credencial** | Contraseña larga (1 año+) | Token temporal (1 hora) |
| **Almacenamiento** | En GitHub como secret | No se almacena |
| **Si se filtra** | 😱 Acceso permanente | ✅ Solo 1 hora |
| **Rotación** | Manual | Automática por job |
| **Complejidad** | Baja | Media |
| **Seguridad** | Media | **Alta** |
| **Mejor Práctica** | No recomendado | ✅ **Recomendado** |

---

## 📊 Comparativa de métodos

### 1. Service Principal Secret (Anterior)
```yaml
steps:
  - uses: azure/login@v2
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}  # ⚠️ Contiene contraseña
```
**Problemas:**
- La contraseña se almacena en GitHub como secret
- Válida por 1 año (mucho tiempo)
- Si se filtra, hay riesgo permanente
- Requiere rotación manual

---

### 2. OIDC (Recomendado) ✅
```yaml
permissions:
  id-token: write  # Necesario para OIDC

steps:
  - uses: azure/login@v2
    with:
      client-id: ${{ secrets.AZURE_CLIENT_ID }}
      tenant-id: ${{ secrets.AZURE_TENANT_ID }}
      subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```
**Ventajas:**
- No almacena contraseñas en GitHub
- Token se genera automáticamente por job
- Se expira después de 1 hora
- Rotación automática
- Más seguro ✅

---

## 🚀 Configuración paso a paso

### Requisitos previos:
- Azure CLI instalado (`az cli`)
- GitHub CLI instalado (`gh`)
- Acceso a Azure como Owner/Admin
- Acceso al repositorio GitHub

### **PASO 1: Obtener información del Service Principal**

```powershell
# Obtén el Client ID (appId) de tu Service Principal
$clientId = "0f9e7724-7a9f-445b-b394-3bc391a2978d"  # Reemplaza con tu ID

# Verifica que existe
az ad app show --id $clientId
```

**Output esperado:**
```json
{
  "appId": "0f9e7724-7a9f-445b-b394-3bc391a2978d",
  "displayName": "sp-secular-hub"
}
```

---

### **PASO 2: Crear Federated Credential en Azure**

```powershell
$clientId = "0f9e7724-7a9f-445b-b394-3bc391a2978d"
$repo = "JuanJesusRamirez/Secular_Hub_App"

# Crea la federated credential
az ad app federated-credential create `
  --id $clientId `
  --parameters '{
    "name": "github-'$repo.Split("/")[1].ToLower()'",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:'$repo':ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

**¿Qué significa cada parte?**
- `issuer`: GitHub Actions es el emisor del token
- `subject`: Solo acepta tokens de este repo específico, rama main
- `audiences`: El token es para Azure

---

### **PASO 2.1: Crear Federated Credentials para UAT y PRD**

Si tu workflow necesita ejecutar `terraform apply` en ramas `uat` y `prd`, debes crear credenciales federadas adicionales:

```powershell
$clientId = "0f9e7724-7a9f-445b-b394-3bc391a2978d"
$repo = "JuanJesusRamirez/Secular_Hub_App"

# Crear credencial para rama UAT
az ad app federated-credential create `
  --id $clientId `
  --parameters '{
    "name": "github-uat",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:'$repo':ref:refs/heads/uat",
    "audiences": ["api://AzureADTokenExchange"]
  }'

# Crear credencial para rama PRD
az ad app federated-credential create `
  --id $clientId `
  --parameters '{
    "name": "github-prd",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:'$repo':ref:refs/heads/prd",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

**Verificar todas las credenciales:**
```powershell
az ad app federated-credential list --id $clientId -o table
```

**Output esperado:**
```
Name              Subject
────────────────  ─────────────────────────────────────────────────────
github-main       repo:JuanJesusRamirez/Secular_Hub_App:ref:refs/heads/main
github-uat        repo:JuanJesusRamirez/Secular_Hub_App:ref:refs/heads/uat
github-prd        repo:JuanJesusRamirez/Secular_Hub_App:ref:refs/heads/prd
```

> ⚠️ **Nota:** Azure AD tiene un límite de 20 federated credentials por App Registration.

---

### **PASO 3: Configurar secrets en GitHub**

Necesitas **solo 3 secrets** (sin contraseña):

```powershell
$owner = "JuanJesusRamirez"
$repo = "Secular_Hub_App"

# Autentica con GitHub
gh auth login

# Crea los 3 secrets
gh secret set AZURE_CLIENT_ID `
  --body "0f9e7724-7a9f-445b-b394-3bc391a2978d" `
  -R "$owner/$repo"

gh secret set AZURE_TENANT_ID `
  --body "813a63fc-75cc-4c00-b086-0e0a5151bb51" `
  -R "$owner/$repo"

gh secret set AZURE_SUBSCRIPTION_ID `
  --body "4730c31d-4c41-46bc-83aa-b4975fe8e80a" `
  -R "$owner/$repo"

# Verifica
gh secret list -R "$owner/$repo"
```

---

### **PASO 4: Actualizar GitHub Actions Workflow**

Agrega estos cambios a tu `.github/workflows/deploy.yml`:

```yaml
name: Deploy

# ✅ Agregar permisos (CRÍTICO para OIDC)
permissions:
  id-token: write
  contents: read

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # ✅ Login con OIDC (sin contraseña)
      - name: Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          # ❌ NO incluyas auth-type (OIDC es el default)
          # ❌ NO incluyas client-secret

      # Para Terraform
      - name: Deploy with Terraform
        env:
          ARM_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
          ARM_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
          ARM_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          ARM_USE_OIDC: true  # ✅ Crítico
        run: |
          terraform init
          terraform plan
          terraform apply -auto-approve
```

**Cambios clave:**
- ✅ `permissions.id-token: write` (necesario para OIDC)
- ✅ Sin `client-secret` en secrets
- ✅ Sin `auth-type: SERVICE_PRINCIPAL`
- ✅ `ARM_USE_OIDC: true` para Terraform

---

### **PASO 5: Hacer Push**

```powershell
git add .github/workflows/
git commit -m "feat: implement OIDC authentication for Azure"
git push
```

El workflow se ejecutará automáticamente. Ve a GitHub → Actions para ver los logs.

---

## ✔️ Verificación

### 1. Verificar que la Federated Credential se creó:

```powershell
az ad app federated-credential list --id 0f9e7724-7a9f-445b-b394-3bc391a2978d -o table
```

**Output esperado:**
```
Name                    Issuer
──────────────────────  ──────────────────────────────────────
github-secular-hub      https://token.actions.githubusercontent.com
```

### 2. Verificar los secrets en GitHub:

```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
gh secret list -R "JuanJesusRamirez/Secular_Hub_App"
```

**Output esperado:**
```
NAME                  UPDATED
AZURE_CLIENT_ID       5 minutes ago
AZURE_TENANT_ID       5 minutes ago
AZURE_SUBSCRIPTION_ID 5 minutes ago
```

### 3. Verificar en GitHub Web:

1. Ve a tu repo en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Deberías ver los 3 secrets (GitHub NO muestra el contenido)

### 4. Ver los logs del workflow:

1. Ve a tu repo en GitHub
2. **Actions** → Haz click en tu último workflow
3. Busca el step "Azure Login"
4. Si ves "Login succeeded" → ¡Está funcionando! ✅

---

## 🔧 Troubleshooting

### Error: "Not all values are present. Ensure 'client-id' and 'tenant-id' are supplied"

**Causa:** Falta la Federated Credential en Azure

**Solución:**
```powershell
# Verifica que existe
az ad app federated-credential list --id $clientId

# Si está vacío, créala (ver PASO 2)
```

---

### Error: "AADSTS700023: Client assertion validation failure"

**Causa:** La Federated Credential no está configurada correctamente

**Solución:**
- Verifica que el `subject` en la credential coincide exactamente con tu repo
- Formato correcto: `repo:OWNER/REPO:ref:refs/heads/main`

```powershell
# Ver la credential
az ad app federated-credential list --id $clientId -o json | ConvertFrom-Json | Select-Object name, issuer, subject
```

---

### Error: "Insufficient privileges to complete the operation"

**Causa:** El Service Principal no tiene permisos en la suscripción

**Solución:**
1. Ve a Azure Portal → Subscriptions → Access Control (IAM)
2. Agrega un Role Assignment:
   - Role: `Contributor` (o el role específico que necesites)
   - Assign to: `Service Principal`
   - Select: Tu Service Principal (`sp-secular-hub`)

```powershell
# Verificar roles
az role assignment list --assignee 0f9e7724-7a9f-445b-b394-3bc391a2978d
```

---

### Error: "permissions.id-token: write not set"

**Causa:** Olvidaste agregar permisos en el workflow

**Solución:**
```yaml
permissions:
  id-token: write  # ✅ Agregar esto
  contents: read
```

---

## 📚 Para otros proyectos

### Template mínimo de workflow:

```yaml
name: Deploy

permissions:
  id-token: write
  contents: read

on:
  push:
    branches: [main]

env:
  AZURE_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
  AZURE_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
  AZURE_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Azure Login
        uses: azure/login@v2
        with:
          client-id: ${{ env.AZURE_CLIENT_ID }}
          tenant-id: ${{ env.AZURE_TENANT_ID }}
          subscription-id: ${{ env.AZURE_SUBSCRIPTION_ID }}

      - name: Run Azure CLI
        run: az account show
```

### Script reutilizable para configurar OIDC:

```powershell
# setup-oidc.ps1
param(
  [string]$ClientId,
  [string]$RepoOwner,
  [string]$RepoName,
  [string]$CredentialName
)

$subject = "repo:$RepoOwner/$RepoName:ref:refs/heads/main"

az ad app federated-credential create `
  --id $ClientId `
  --parameters '{
    "name": "'$CredentialName'",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "'$subject'",
    "audiences": ["api://AzureADTokenExchange"]
  }'

Write-Host "✅ Federated Credential created: $CredentialName"
Write-Host "Subject: $subject"
```

**Uso:**
```powershell
.\setup-oidc.ps1 `
  -ClientId "0f9e7724-7a9f-445b-b394-3bc391a2978d" `
  -RepoOwner "JuanJesusRamirez" `
  -RepoName "Secular_Hub_App" `
  -CredentialName "github-secular-hub"
```

---

## 📖 Referencias

- [Azure Login Action - OIDC Documentation](https://github.com/Azure/login#login-with-openid-connect-oidc-recommended)
- [GitHub Actions - OIDC Token](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Azure AD Workload Identity Federation](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-create-trust)
- [Terraform Azure Provider - OIDC](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs#authenticating-to-azure-with-workload-identity-federation)

---

## 📝 Checklist de Implementación

- [ ] Obtuviste el Client ID del Service Principal
- [ ] Creaste la Federated Credential en Azure
- [ ] Configuraste los 3 secrets en GitHub (SIN contraseña)
- [ ] Actualizaste el workflow con `permissions.id-token: write`
- [ ] Removiste `ARM_CLIENT_SECRET` de variables de entorno
- [ ] Agregaste `ARM_USE_OIDC: true` a Terraform
- [ ] Hiciste push de los cambios
- [ ] Verificaste que el workflow ejecutó exitosamente
- [ ] Eliminaste secretos antiguos (si los tenías)

---

**Última actualización:** 7 de enero, 2026
**Autor:** AI Assistant
**Versión:** 1.0
