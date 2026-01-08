output "container_app_fqdn" {
  value       = azurerm_container_app.app.ingress[0].fqdn
  description = "FQDN of the Container App"
}

output "container_app_name" {
  value       = azurerm_container_app.app.name
  description = "Container App name"
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
