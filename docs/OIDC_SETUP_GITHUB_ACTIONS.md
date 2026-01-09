# OIDC Setup para GitHub Actions → Azure

## ¿Qué es OIDC?

OIDC (OpenID Connect) permite que **GitHub Actions se autentique directamente en Azure sin usar secrets (credenciales)**.  
En su lugar, GitHub firma digitalmente un token que Azure valida.

### Ventajas
- ❌ NO exponemos `clientSecret` ni credenciales
- ✅ Autenticación segura basada en identidad
- ✅ Token temporal, válido solo para GitHub Actions
- ✅ Granular: puedes limitar qué repos/ramas pueden autenticarse

---

## Configuración Completada

### 1. Application Registration en Azure AD
- **Nombre**: `secular-hub-github`
- **Client ID**: `0f9e7724-7a9f-445b-b394-3bc391a2978d`
- **Tenant ID**: `813a63fc-75cc-4c00-b086-0e0a5151bb51`

### 2. Credencial Federada OIDC
Creada con los siguientes parámetros:
```json
{
  "name": "github-dev-branch",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:JuanJesusRamirez/Secular_Hub_App:ref:refs/heads/dev",
  "audiences": ["api://AzureADTokenExchange"]
}
```

**Qué significa:**
- **Issuer**: GitHub es el emisor (https://token.actions.githubusercontent.com)
- **Subject**: Solo se permite desde `dev` branch del repo `JuanJesusRamirez/Secular_Hub_App`
- **Audience**: El token es para Azure (`api://AzureADTokenExchange`)

### 3. GitHub Secrets Configurados
Necesitas estos 3 secrets en tu repositorio (Settings → Secrets):

```
AZURE_CLIENT_ID = 0f9e7724-7a9f-445b-b394-3bc391a2978d
AZURE_TENANT_ID = 813a63fc-75cc-4c00-b086-0e0a5151bb51
AZURE_SUBSCRIPTION_ID = 4730c31d-4c41-46bc-83aa-b4975fe8e80a
```

**⚠️ NO incluyas `clientSecret`** — el punto de OIDC es eliminarlo.

---

## Cómo Funciona en GitHub Actions

### Workflow `build-and-push-image.yml`:
```yaml
- name: Azure Login (OIDC)
  uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

**Pasos internos:**
1. GitHub Actions genera un JWT firmado con su private key
2. El JWT incluye: issuer, subject (repo:branch), audience
3. GitHub lo envía a Azure AD
4. Azure valida la firma y el certificado
5. Azure compara issuer, subject, audience con la credencial federada
6. Si coinciden → emite un token de acceso
7. El workflow usa ese token para autenticarse en Azure

---

## Flujo de Despliegue (Completo)

### Push a `dev` → Workflow 1: Build & Push
```mermaid
1. Push code a dev (Dockerfile, src, etc.)
   ↓
2. GitHub Actions ejecuta build-and-push-image.yml
   ↓
3. Azure Login vía OIDC (sin secrets)
   ↓
4. Docker build + push a acrsecularhub.azurecr.io/secular-hub:<sha>
   ↓
5. Workflow completa
   ↓
6. Dispara automáticamente deploy-dev.yml (workflow_run)
```

### Workflow 2: Deploy to Dev
```mermaid
1. deploy-dev.yml recibe commit SHA de la imagen
   ↓
2. Azure Login vía OIDC
   ↓
3. terraform init (backend remoto)
   ↓
4. terraform apply -var="image_tag=<sha>"
   ↓
5. Container App se actualiza con la imagen
   ↓
6. Captura outputs (FQDN, ACR login server)
```

---

## Testing Local

Para verificar que todo está configurado correctamente:

```powershell
# En local, usarás tu sesión de az login actual
# En GitHub Actions, usará la credencial federada OIDC

.\scripts\test-oidc.ps1
```

Esto debería:
- ✅ Loguear en Azure
- ✅ Mostrar ACRs disponibles
- ✅ Confirmar que puedes hacer push a `acrsecularhub.azurecr.io`

---

## Troubleshooting

### Error: "No matching federated identity record found"
**Causa**: La credencial federada no coincide con el subject del token.

**Solución**:
```bash
# Verifica la credencial:
az ad app federated-credential list --id 0f9e7724-7a9f-445b-b394-3bc391a2978d

# Output esperado:
# - name: github-dev-branch
# - subject: repo:JuanJesusRamirez/Secular_Hub_App:ref:refs/heads/dev
# - issuer: https://token.actions.githubusercontent.com
```

### Error: "Insufficient privileges"
**Causa**: La aplicación no tiene permisos en la suscripción.

**Solución**: Asigna rol a la aplicación:
```bash
$appId = "0f9e7724-7a9f-445b-b394-3bc391a2978d"
$subscriptionId = "4730c31d-4c41-46bc-83aa-b4975fe8e80a"

az role assignment create \
  --assignee $appId \
  --role "Owner" \
  --scope "/subscriptions/$subscriptionId"
```

### Error: "ACR login failed"
**Causa**: El container app no tiene AcrPull role.

**Verificación**:
```bash
# Verifica que el role assignment existe:
az role assignment list \
  --scope "/subscriptions/4730c31d-4c41-46bc-83aa-b4975fe8e80a/resourceGroups/rg-secular-hub-dev/providers/Microsoft.ContainerRegistry/registries/acrsecularhub" \
  --all
```

---

## Referencias

- [GitHub Actions OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [Azure Workload Identity Federation](https://learn.microsoft.com/entra/workload-id/workload-identity-federation)
- [Azure CLI Login with OIDC](https://github.com/Azure/login#configure-a-federated-credential-to-use-oidc)

---

## Próximos Pasos

1. **Verifica los secrets** están en GitHub (Settings → Secrets)
2. **Haz un push a `dev`** para disparar el workflow
3. **Monitorea** en GitHub Actions → Workflow runs
4. **Verifica** que la imagen se publicó en ACR
5. **Confirma** que el Container App está ejecutando la imagen

Si todo funciona, el ciclo es **completamente automatizado** y **sin secrets**.
