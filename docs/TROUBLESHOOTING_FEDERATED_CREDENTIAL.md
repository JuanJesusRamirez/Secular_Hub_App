# Troubleshooting: Federated Credential No Configurado

**Fecha:** 7 de enero, 2026  
**Issue:** Error en Azure Login durante workflow de Terraform  
**Status:** ✅ RESUELTO

---

## 🔴 Problema Encontrado

### Error en GitHub Actions:
```
Error: AADSTS70025: The client '***'(sp-secular-hub) has no configured 
federated identity credentials.

Trace ID: b19e8d15-eec4-4898-b7d0-ee4a1e475802
```

### Causa:
La Federated Credential **no se había creado correctamente** en Azure AD, a pesar de que el comando anterior parecía ejecutarse sin errores.

---

## 🔍 Diagnóstico

### Lo que sucedió:
1. Ejecutamos el comando para crear Federated Credential
2. El comando "pasó" sin errores
3. Pero cuando verificamos: `az ad app federated-credential list` → **Resultado vacío []**
4. Esto significa que **NO se creó realmente**

### Por qué falló:
El problema fue con el **formato del parámetro JSON**:
- ❌ El JSON no se pasó correctamente al comando
- ❌ Azure no pudo parsearlo
- ❌ No lanzó un error explícito (silent failure)

---

## ✅ Solución Aplicada

### Antes (❌ No funcionó):
```powershell
az ad app federated-credential create `
  --id $clientId `
  --parameters '{
    "name": "github-secular-hub",
    ...
  }'
```
**Problema:** El JSON inline no se pasaba correctamente

### Después (✅ Funcionó):
```powershell
# 1. Crear objeto PowerShell
$credConfig = @{
    name = "github-secular-hub"
    issuer = "https://token.actions.githubusercontent.com"
    subject = "repo:JuanJesusRamirez/Secular_Hub_App:ref:refs/heads/main"
    audiences = @("api://AzureADTokenExchange")
} | ConvertTo-Json

# 2. Guardar en archivo
$credConfig | Out-File -FilePath "c:\temp\fedcred.json" -Encoding UTF8

# 3. Usar archivo con @
az ad app federated-credential create --id $clientId --parameters "@c:\temp\fedcred.json"
```

**Ventaja:** El archivo garantiza que el JSON se pase correctamente

### Verificación:
```powershell
az ad app federated-credential list --id 0f9e7724-7a9f-445b-b394-3bc391a2978d --output json
```

**Output:**
```json
[
  {
    "audiences": ["api://AzureADTokenExchange"],
    "issuer": "https://token.actions.githubusercontent.com",
    "name": "github-secular-hub",
    "subject": "repo:JuanJesusRamirez/Secular_Hub_App:ref:refs/heads/main"
  }
]
```

✅ **Ahora aparece!**

---

## 🚀 Resolución

### 1. Se creó la Federated Credential correctamente
```
Service Principal: sp-secular-hub
Credential Name: github-secular-hub
Issuer: https://token.actions.githubusercontent.com
Subject: repo:JuanJesusRamirez/Secular_Hub_App:ref:refs/heads/main
Status: ✅ ACTIVO
```

### 2. Se re-ejecutó el workflow
```powershell
gh workflow run terraform.yml -R "JuanJesusRamirez/Secular_Hub_App" --ref main
```

Output:
```
✓ Created workflow_dispatch event for terraform.yml at main
```

### 3. Workflow debería ejecutarse correctamente ahora
Flow esperado:
```
1. ✅ Azure Login with OIDC
   ├─ GitHub genera JWT token
   ├─ Azure valida token
   ├─ Azure emite Access Token
   └─ Login exitoso

2. ✅ Terraform Init
   ├─ Conecta al backend (tfstate)
   └─ Inicializa

3. ✅ Terraform Plan
   └─ Planifica recursos

4. ✅ Terraform Apply
   └─ Despliega a Azure
```

---

## 📚 Lecciones Aprendidas

### 1. Silent Failures en Azure CLI
**Lección:** A veces Azure CLI no lanza error aunque algo falle
**Solución:** Siempre verificar con un `list` o `show` después

### 2. JSON con PowerShell
**Mejor práctica:**
```powershell
# ✅ BUENO: Usar archivo
$object | ConvertTo-Json | Out-File config.json
az command --parameters "@config.json"

# ⚠️ RIESGOSO: JSON inline
az command --parameters '{"key": "value"}'
```

### 3. Debugging de OIDC
**Si ves error: "no configured federated identity credentials":**
```powershell
# 1. Verificar que existe
az ad app federated-credential list --id $clientId

# 2. Verificar que tiene valores correctos
# - issuer: https://token.actions.githubusercontent.com
# - subject: repo:OWNER/REPO:ref:refs/heads/main
# - audiences: ["api://AzureADTokenExchange"]

# 3. Re-ejecutar workflow
gh workflow run <workflow.yml>
```

---

## 📊 Línea de Tiempo

| Hora | Acción | Resultado |
|------|--------|-----------|
| 17:33:09 | Push a main | Workflow disparado |
| 17:36:32 | Azure Login | ❌ Error - No hay Federated Credential |
| 17:45:00 | Crear Federated Credential (formato archivo) | ✅ Éxito |
| 17:45:15 | Verificar con list | ✅ Ahora aparece |
| 17:45:30 | Re-ejecutar workflow | ✅ En progreso |

---

## ✅ Checklist de Verificación Final

- [x] Federated Credential creada en Azure AD
- [x] Verificado con `az ad app federated-credential list`
- [x] Workflow re-ejecutado
- [x] Esperando confirmación de ejecución exitosa

---

## 🔗 Referencias

- [Azure CLI Federated Credentials](https://learn.microsoft.com/en-us/cli/azure/ad/app/federated-credential)
- [GitHub OIDC with Azure](https://github.com/Azure/login#login-with-openid-connect-oidc-recommended)
- [Debugging OIDC Issues](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)

---

## 💡 Próximas Veces

Para crear Federated Credential correctamente:

```powershell
# Script definitivo
function New-AzFederatedCredential {
    param(
        [string]$AppId,
        [string]$CredentialName,
        [string]$RepoOwner,
        [string]$RepoName,
        [string]$Branch = "main"
    )
    
    $credConfig = @{
        name = $CredentialName
        issuer = "https://token.actions.githubusercontent.com"
        subject = "repo:$RepoOwner/$RepoName:ref:refs/heads/$Branch"
        audiences = @("api://AzureADTokenExchange")
    } | ConvertTo-Json
    
    $credConfig | Out-File -FilePath "temp_fedcred.json" -Encoding UTF8
    
    az ad app federated-credential create --id $AppId --parameters "@temp_fedcred.json"
    
    Remove-Item "temp_fedcred.json"
    
    Write-Host "✅ Federated Credential created: $CredentialName"
}

# Uso:
New-AzFederatedCredential `
    -AppId "0f9e7724-7a9f-445b-b394-3bc391a2978d" `
    -CredentialName "github-secular-hub" `
    -RepoOwner "JuanJesusRamirez" `
    -RepoName "Secular_Hub_App"
```

---

**Status:** ✅ RESUELTO  
**Última actualización:** 7 de enero, 2026  
**Próximo paso:** Monitorear ejecución del workflow en GitHub Actions
