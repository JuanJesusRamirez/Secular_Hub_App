# Cómo Agregar Credenciales Federadas OIDC para GitHub Actions + Azure

> **Propósito:** Guía paso a paso para configurar autenticación OIDC cuando GitHub Actions no puede conectarse a Azure. Reutilizable para cualquier branch o repositorio.

---

## 🔴 Identificando el Problema

### Error Típico en GitHub Actions:
```
Error: AADSTS700213: No matching federated identity record found for presented 
assertion subject 'repo:<OWNER>/<REPO>:ref:refs/heads/<BRANCH>'. 
Check your federated identity credential Subject, Audience and Issuer against 
the presented assertion.
```

### ¿Qué significa?
Azure no encontró una **credencial federada** que coincida con el branch desde el cual se ejecutó el workflow. Esto impide que GitHub Actions se autentique usando OIDC.

### Causa Raíz:
- El workflow está configurado para ejecutarse en un branch específico
- Pero ese branch **NO** tiene una credencial federada configurada en Azure AD
- Azure rechaza la autenticación por seguridad

---

## 🔍 Pasos de Diagnóstico

### 1. Identificar el Branch Problemático
Revisa el error de GitHub Actions. El `subject` te dice qué branch intentó autenticarse:
```
subject: repo:<OWNER>/<REPO>:ref:refs/heads/<BRANCH_NAME>
```

### 2. Obtener el Application ID
Necesitas el `client-id` de tu Azure App Registration:
- Ve a Azure Portal → Microsoft Entra ID → App registrations
- O revisa tus GitHub Secrets: `AZURE_CLIENT_ID`

### 3. Verificar Credenciales Existentes
```powershell
az ad app federated-credential list --id <YOUR_CLIENT_ID> --output table
```

Esto te muestra qué branches ya tienen credenciales configuradas.

---

## ✅ Solución: Agregar Credencial Federada

### Paso 1: Preparar la Configuración

```powershell
# Reemplaza con tus valores:
# - <CREDENTIAL_NAME>: Nombre descriptivo (ej: "github-uat-branch")
# - <OWNER>/<REPO>: Tu repositorio de GitHub
# - <BRANCH_NAME>: El branch que necesita autenticación

$credConfig = @{
    name = "<CREDENTIAL_NAME>"
    issuer = "https://token.actions.githubusercontent.com"
    subject = "repo:<OWNER>/<REPO>:ref:refs/heads/<BRANCH_NAME>"
    audiences = @("api://AzureADTokenExchange")
} | ConvertTo-Json
```

**Ejemplo real:**
```powershell
$credConfig = @{
    name = "github-uat-v1"
    issuer = "https://token.actions.githubusercontent.com"
    subject = "repo:MiUsuario/MiRepo:ref:refs/heads/uat_v1"
    audiences = @("api://AzureADTokenExchange")
} | ConvertTo-Json
```

### Paso 2: Guardar en Archivo Temporal
```powershell
$credConfig | Out-File -FilePath "$env:TEMP\fedcred-new.json" -Encoding UTF8
```

### Paso 3: Crear la Credencial en Azure
```powershell
az ad app federated-credential create `
  --id <YOUR_CLIENT_ID> `
  --parameters "@$env:TEMP\fedcred-new.json"
```

### Paso 4: Verificar que se Creó
```powershell
az ad app federated-credential list --id <YOUR_CLIENT_ID> --output table
```

Deberías ver tu nueva credencial en la lista.

---

## 📋 Patrones Comunes de Subject

### Para Branches Específicos:
```
subject: "repo:<OWNER>/<REPO>:ref:refs/heads/<BRANCH>"
```

### Para Pull Requests:
```
subject: "repo:<OWNER>/<REPO>:pull_request"
```

### Para Tags:
```
subject: "repo:<OWNER>/<REPO>:ref:refs/tags/*"
```

### Para Environments:
```
subject: "repo:<OWNER>/<REPO>:environment:<ENV_NAME>"
```

---

## 🛠️ Comandos Útiles

### Listar Todas las Credenciales:
```powershell
az ad app federated-credential list --id <YOUR_CLIENT_ID> --output json
```

### Eliminar una Credencial:
```powershell
az ad app federated-credential delete `
  --id <YOUR_CLIENT_ID> `
  --federated-credential-id "<CREDENTIAL_NAME>"
```

### Mostrar Detalles de una Credencial:
```powershell
az ad app federated-credential show `
  --id <YOUR_CLIENT_ID> `
  --federated-credential-id "<CREDENTIAL_NAME>"
```

---

## ⚡ Solución Rápida (Copy-Paste)

```powershell
# 1. Define tus valores
$clientId = "<TU_AZURE_CLIENT_ID>"
$credName = "github-<BRANCH_NAME>"
$owner = "<GITHUB_OWNER>"
$repo = "<GITHUB_REPO>"
$branch = "<BRANCH_NAME>"

# 2. Crea la configuración
$credConfig = @{
    name = $credName
    issuer = "https://token.actions.githubusercontent.com"
    subject = "repo:$owner/${repo}:ref:refs/heads/$branch"
    audiences = @("api://AzureADTokenExchange")
} | ConvertTo-Json

# 3. Guarda en archivo temporal
$tempFile = "$env:TEMP\fedcred-$branch.json"
$credConfig | Out-File -FilePath $tempFile -Encoding UTF8

# 4. Crea la credencial
az ad app federated-credential create --id $clientId --parameters "@$tempFile"

# 5. Verifica
az ad app federated-credential list --id $clientId --output table
```

---

## 🎯 Checklist Post-Solución

- [ ] La credencial aparece en `az ad app federated-credential list`
- [ ] El `subject` coincide exactamente con el branch del workflow
- [ ] Re-ejecutar el workflow en GitHub Actions
- [ ] Verificar que Azure Login sea exitoso
- [ ] Confirmar que el resto del workflow se ejecute correctamente

---

## 🚨 Troubleshooting Adicional

### Error persiste después de crear la credencial:
1. **Espera 5-10 minutos**: Azure puede tardar en propagar los cambios
2. **Verifica el subject**: Debe coincidir EXACTAMENTE con el formato del error
3. **Revisa el workflow**: Confirma que esté configurado para el branch correcto
4. **Valida los secrets**: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`

### El comando `az ad app` falla:
- Asegúrate de estar autenticado: `az login`
- Verifica que tengas permisos de Application Administrator en Azure AD
- Usa `az account show` para confirmar que estás en el tenant correcto

---

## 📚 Referencias

- [Microsoft: Workload Identity Federation](https://learn.microsoft.com/entra/workload-id/workload-identity-federation)
- [GitHub: OIDC with Azure](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-azure)
- [Azure CLI: Federated Credentials](https://learn.microsoft.com/cli/azure/ad/app/federated-credential)

---

## 📝 Notas

- **Seguridad**: Las credenciales federadas son más seguras que usar secrets con contraseñas
- **Granularidad**: Puedes controlar exactamente qué branches/PRs pueden autenticarse
- **Sin Expiración**: A diferencia de secrets, las credenciales federadas no expiran
- **Auditable**: Azure registra todos los intentos de autenticación OIDC
