# Resource Group para este ambiente (dev o uat)
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}

# ACR compartido (ya existe en secular-hub-app-rg)
data "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = "secular-hub-app-rg"
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "law" {
  name                = "law-${var.env}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# Container App Environment
resource "azurerm_container_app_environment" "main" {
  name                = "cae-${var.container_app_name}-${var.env}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

# Container App (dev o uat)
resource "azurerm_container_app" "main" {
  name                         = "ca-${var.container_app_name}-${var.env}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  identity {
    type = "SystemAssigned"
  }

  template {
    container {
      name   = "secular-hub"
      image  = "${data.azurerm_container_registry.acr.login_server}/secular-hub:${var.image_tag}"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "PORT"
        value = "3000"
      }
    }

    min_replicas = 1
    max_replicas = 3
  }

  registry {
    server   = data.azurerm_container_registry.acr.login_server
    identity = azurerm_container_app.main.identity[0].principal_id
  }

  ingress {
    allow_insecure_connections = false
    external_enabled           = true
    target_port                = 3000

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }
}

# Assign AcrPull role al Managed Identity del Container App
resource "azurerm_role_assignment" "acr_pull" {
  scope                = data.azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_container_app.main.identity[0].principal_id
}
