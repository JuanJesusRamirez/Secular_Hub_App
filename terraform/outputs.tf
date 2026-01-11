output "container_app_url" {
  description = "URL del Container App"
  value       = "https://${azurerm_container_app.main.latest_revision_fqdn}"
}

output "acr_login_server" {
  description = "ACR Login Server"
  value       = data.azurerm_container_registry.acr.login_server
}

output "resource_group_name" {
  description = "Nombre del Resource Group"
  value       = azurerm_resource_group.main.name
}

output "environment" {
  description = "Ambiente desplegado"
  value       = var.env
}
