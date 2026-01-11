# Script para inicializar Terraform workspaces para dev y uat
# Ejecutar desde la carpeta terraform/

Write-Host "Inicializando Terraform..." -ForegroundColor Green
terraform init

Write-Host "`nCreando workspace 'dev'..." -ForegroundColor Cyan
terraform workspace new dev -ErrorAction SilentlyContinue

Write-Host "Creando workspace 'uat'..." -ForegroundColor Cyan
terraform workspace new uat -ErrorAction SilentlyContinue

Write-Host "`nWorkspaces disponibles:" -ForegroundColor Green
terraform workspace list

Write-Host "`nWorkspaces creados exitosamente. Ahora puedes usar:" -ForegroundColor Yellow
Write-Host "  terraform workspace select dev"
Write-Host "  terraform plan -var-file=../envs/dev.tfvars"
Write-Host ""
Write-Host "  terraform workspace select uat"
Write-Host "  terraform plan -var-file=../envs/uat.tfvars"
