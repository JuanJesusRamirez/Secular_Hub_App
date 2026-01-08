# =============================================================================
# UAT Outputs
# =============================================================================
output "uat_fqdn" {
  value       = azurerm_container_app.app_uat.latest_revision_fqdn
  description = "FQDN of the UAT Container App"
}

output "uat_name" {
  value       = azurerm_container_app.app_uat.name
  description = "UAT Container App name"
}

output "uat_acr_login_server" {
  value       = azurerm_container_registry.acr_uat.login_server
  description = "Login server of the UAT Container Registry"
}

output "uat_acr_name" {
  value       = azurerm_container_registry.acr_uat.name
  description = "UAT Container Registry name"
}

output "uat_environment_name" {
  value       = azurerm_container_app_environment.env_uat.name
  description = "UAT Container App Environment name"
}

# =============================================================================
# PRD Outputs
# =============================================================================
output "prd_fqdn" {
  value       = azurerm_container_app.app_prd.latest_revision_fqdn
  description = "FQDN of the PRD Container App"
}

output "prd_name" {
  value       = azurerm_container_app.app_prd.name
  description = "PRD Container App name"
}

output "prd_acr_login_server" {
  value       = azurerm_container_registry.acr_prd.login_server
  description = "Login server of the PRD Container Registry"
}

output "prd_acr_name" {
  value       = azurerm_container_registry.acr_prd.name
  description = "PRD Container Registry name"
}

output "prd_environment_name" {
  value       = azurerm_container_app_environment.env_prd.name
  description = "PRD Container App Environment name"
}

# =============================================================================
# Shared Outputs
# =============================================================================
output "app_insights_instrumentation_key" {
  value       = try(azurerm_application_insights.ai[0].instrumentation_key, "")
  description = "Instrumentation key for App Insights (if created)"
  sensitive   = true
}
