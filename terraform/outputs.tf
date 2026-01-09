output "container_app_fqdn" {
  description = "FQDN of the Container App"
  value       = azurerm_container_app.app_dev.latest_revision_fqdn
}

output "acr_login_server" {
  description = "Login server for the Azure Container Registry"
  value       = azurerm_container_registry.acr.login_server
}

output "resource_group_dev" {
  description = "Resource Group for DEV resources"
  value       = azurerm_resource_group.dev.name
}
