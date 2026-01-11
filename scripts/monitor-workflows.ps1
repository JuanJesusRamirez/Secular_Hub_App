#!/usr/bin/env pwsh
<#
.SYNOPSIS
Monitor GitHub Actions workflow status and ACR image deployment

.DESCRIPTION
Polls GitHub API to check build-and-push-image and deploy-dev workflow status
#>

param(
    [string]$Owner = "JuanJesusRamirez",
    [string]$Repo = "Secular_Hub_App",
    [string]$Branch = "dev",
    [int]$MaxWaitSeconds = 600
)

$ErrorActionPreference = "Stop"

Write-Host "🔍 Monitoring GitHub Actions Workflows..." -ForegroundColor Cyan
Write-Host "Repo: $Owner/$Repo (branch: $Branch)" -ForegroundColor Gray
Write-Host ""

$startTime = Get-Date
$acrName = "acrsecularhubshared"
$imageName = "secular-hub"

# Function to get workflow runs
function Get-WorkflowRuns {
    param(
        [string]$WorkflowName
    )
    
    $uri = "https://api.github.com/repos/$Owner/$Repo/actions/workflows/$WorkflowName/runs?branch=$Branch&per_page=1"
    $response = Invoke-RestMethod -Uri $uri -Headers @{ "User-Agent" = "PowerShell" } -ErrorAction SilentlyContinue
    return $response.workflow_runs | Select-Object -First 1
}

# Monitor workflows
$buildWorkflow = "build-and-push-image.yml"
$deployWorkflow = "deploy-dev.yml"

$buildStatus = $null
$deployStatus = $null
$imageFound = $false
$elapsedSeconds = 0

while ($elapsedSeconds -lt $MaxWaitSeconds) {
    $elapsed = (Get-Date) - $startTime
    $elapsedSeconds = [int]$elapsed.TotalSeconds
    
    # Check build workflow
    $buildRun = Get-WorkflowRuns -WorkflowName $buildWorkflow
    if ($buildRun) {
        $buildStatus = $buildRun.status
        $buildConclusion = $buildRun.conclusion
        
        Write-Host "[Build] Status: $buildStatus | Conclusion: $buildConclusion | Elapsed: $elapsedSeconds seconds" -ForegroundColor Yellow
        
        if ($buildStatus -eq "completed" -and $buildConclusion -eq "success") {
            Write-Host "✅ Build workflow completed successfully!" -ForegroundColor Green
            
            # Try to find image in ACR
            try {
                $manifests = az acr repository show-manifests --name $acrName --repository $imageName --orderby time_desc --output json 2>/dev/null | ConvertFrom-Json
                if ($manifests -and $manifests.Count -gt 0) {
                    $latestImage = $manifests[0]
                    Write-Host "✅ Image found in ACR: $acrName.azurecr.io/$imageName`:`$($latestImage.tags[0])" -ForegroundColor Green
                    $imageFound = $true
                }
            } catch {
                Write-Host "⏳ Waiting for image to appear in ACR..." -ForegroundColor Gray
            }
        }
    }
    
    # Check deploy workflow (only if build succeeded)
    if ($buildStatus -eq "completed" -and $buildConclusion -eq "success") {
        $deployRun = Get-WorkflowRuns -WorkflowName $deployWorkflow
        if ($deployRun) {
            $deployStatus = $deployRun.status
            $deployConclusion = $deployRun.conclusion
            
            Write-Host "[Deploy] Status: $deployStatus | Conclusion: $deployConclusion | Elapsed: $elapsedSeconds seconds" -ForegroundColor Yellow
            
            if ($deployStatus -eq "completed" -and $deployConclusion -eq "success") {
                Write-Host "✅ Deploy workflow completed successfully!" -ForegroundColor Green
                
                # Get Container App info
                try {
                    $containerApp = az containerapp show -n "secular-hub-api-dev-dev" -g "rg-secular-hub-dev" -o json 2>/dev/null | ConvertFrom-Json
                    if ($containerApp) {
                        $fqdn = $containerApp.properties.configuration.ingress.fqdn
                        $status = $containerApp.properties.runningStatus
                        Write-Host ""
                        Write-Host "🚀 Container App Status: $status" -ForegroundColor Green
                        Write-Host "📍 URL: https://$fqdn" -ForegroundColor Cyan
                    }
                } catch {
                    Write-Host "⚠️ Could not retrieve Container App info" -ForegroundColor Yellow
                }
                
                Write-Host ""
                Write-Host "=" * 60 -ForegroundColor Green
                Write-Host "✅ ALL WORKFLOWS COMPLETED SUCCESSFULLY!" -ForegroundColor Green
                Write-Host "=" * 60 -ForegroundColor Green
                exit 0
            }
        }
    }
    
    # Check for failures
    if ($buildStatus -eq "completed" -and $buildConclusion -eq "failure") {
        Write-Host ""
        Write-Host "❌ Build workflow failed!" -ForegroundColor Red
        Write-Host "Check: https://github.com/$Owner/$Repo/actions" -ForegroundColor Red
        exit 1
    }
    
    if ($deployStatus -eq "completed" -and $deployConclusion -eq "failure") {
        Write-Host ""
        Write-Host "❌ Deploy workflow failed!" -ForegroundColor Red
        Write-Host "Check: https://github.com/$Owner/$Repo/actions" -ForegroundColor Red
        exit 1
    }
    
    # Wait and retry
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "⏱️  Timeout: Workflows didn't complete within $MaxWaitSeconds seconds" -ForegroundColor Yellow
Write-Host "Check status at: https://github.com/$Owner/$Repo/actions" -ForegroundColor Yellow
