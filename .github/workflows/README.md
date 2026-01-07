GitHub Actions workflows in this repository:

- `terraform.yml` : Plan (PR) and Apply (main/workflow_dispatch) — uses `AZURE_CREDENTIALS` for authentication ✅
- `deploy-app.yml` : Build Node app and deploy to App Service using Azure CLI and `AZURE_CREDENTIALS` ✅

Notes:
- Removed legacy `azure-webapps-node.yml` (publish profile) in favor of service-principal based deploys for better secret rotation and CI control.
- Required Secrets:
  - `AZURE_CREDENTIALS` (JSON from `az ad sp create-for-rbac --sdk-auth`)
  - `AZURE_RESOURCE_GROUP` (for deploy workflow)
  - `AZURE_APP_NAME` (for deploy workflow)

Best practices:
- Protect `main` branch and require approvals for environment `production` (used by `terraform.yml`).
- Keep `AZURE_CREDENTIALS` rotated and avoid storing publish profiles in repo secrets.
