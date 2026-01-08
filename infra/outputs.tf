output "uat_fqdn" {
  value       = azurerm_container_app.app_uat.latest_revision_fqdn
  description = "FQDN of the UAT Container App"
}

output "uat_name" {
  value       = azurerm_container_app.app_uat.name
  description = "UAT Container App name"
}

output "prd_fqdn" {
  value       = azurerm_container_app.app_prd.latest_revision_fqdn
  description = "FQDN of the PRD Container App"
}

output "prd_name" {
  value       = azurerm_container_app.app_prd.name
  description = "PRD Container App name"
}

output "container_registry_login_server" {
  value       = azurerm_container_registry.acr.login_server
  description = "Login server of the Container Registry"
}

output "container_registry_name" {
  value       = azurerm_container_registry.acr.name
  description = "Container Registry name"
}

output "app_insights_instrumentation_key" {
  value       = try(azurerm_application_insights.ai[0].instrumentation_key, "")
  description = "Instrumentation key for App Insights (if created)"
  sensitive   = true
}
