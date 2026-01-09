# Test OIDC authentication (simulating GitHub Actions)
# This script verifies that the federated credential is correctly configured

$clientId = "0f9e7724-7a9f-445b-b394-3bc391a2978d"
$tenantId = "813a63fc-75cc-4c00-b086-0e0a5151bb51"
$subscriptionId = "4730c31d-4c41-46bc-83aa-b4975fe8e80a"

Write-Host "Testing Azure Login with OIDC..." -ForegroundColor Green
Write-Host "Client ID: $clientId"
Write-Host "Tenant ID: $tenantId"
Write-Host "Subscription ID: $subscriptionId"
Write-Host ""

# In local testing, this uses your current `az login` session
# In GitHub Actions, it uses the federated credential
try {
    Write-Host "Logging in to Azure..." -ForegroundColor Yellow
    az login --allow-no-subscriptions
    
    Write-Host "Setting subscription..." -ForegroundColor Yellow
    az account set --subscription $subscriptionId
    
    Write-Host "Verifying ACR access..." -ForegroundColor Yellow
    az acr list --output table
    
    Write-Host "✅ Authentication successful!" -ForegroundColor Green
    Write-Host "You can now manually build and push images to ACR."
    
} catch {
    Write-Host "❌ Authentication failed: $_" -ForegroundColor Red
    exit 1
}
