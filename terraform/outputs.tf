output "container_app_urls" {
  description = "URLs de los Container Apps"
  value = {
    for env, app in azurerm_container_app.main :
    env => "https://${app.latest_revision_fqdn}"
  }
}

output "resource_group_names" {
  description = "Nombres de los Resource Groups"
  value = {
    for env, rg in azurerm_resource_group.main :
    env => rg.name
  }
}

output "acr_login_server" {
  description = "ACR Login Server"
  value       = data.azurerm_container_registry.acr.login_server
}

output "environments_deployed" {
  description = "Ambientes desplegados"
  value       = keys(local.environments)
}
