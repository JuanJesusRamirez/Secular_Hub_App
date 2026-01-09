@echo off
REM Simple script to check GitHub Actions workflow status

echo Checking GitHub Actions Workflows...
echo Repo: JuanJesusRamirez/Secular_Hub_App (branch: dev)
echo.
echo Open this URL to monitor workflows:
echo https://github.com/JuanJesusRamirez/Secular_Hub_App/actions
echo.
echo Expected workflow sequence:
echo 1. build-and-push-image.yml (Build Docker image and push to ACR)
echo 2. deploy-dev.yml (Deploy to DEV using Terraform)
echo.
echo Checking ACR for latest images...
az acr repository show-manifests --name acrsecularhub --repository secular-hub --orderby time_desc -o table
echo.
echo Checking Container App status...
az containerapp show -n secular-hub-api-dev-dev -g rg-secular-hub-dev --query "properties.runningStatus" -o tsv
