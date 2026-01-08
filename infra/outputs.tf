output "app_service_default_site_hostname" {
  value       = azurerm_windows_web_app.app.default_hostname
  description = "Hostname of the deployed App Service"
}

output "app_service_name" {
  value       = azurerm_windows_web_app.app.name
  description = "App Service name"
}

output "app_insights_instrumentation_key" {
  value       = try(azurerm_application_insights.ai[0].instrumentation_key, "")
  description = "Instrumentation key for App Insights (if created)"
  sensitive   = true
}
