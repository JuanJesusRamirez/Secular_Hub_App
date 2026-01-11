# =============================================================================
# RESOURCE GROUPS & DATA
# =============================================================================

# Usar terraform.workspace para soportar múltiples ambientes (dev, uat, prod)
locals {
  workspace_env = terraform.workspace
}

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  
  tags = {
    environment = local.workspace_env
  }
}

data "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = "secular-hub-app-rg"
}


# =============================================================================
# MONITORING
# =============================================================================

resource "azurerm_log_analytics_workspace" "law" {
  name                = "law-${var.env}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}


# =============================================================================
# CONTAINER APP ENVIRONMENT
# =============================================================================

resource "azurerm_container_app_environment" "main" {
  name                = "cae-${var.container_app_name}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}


# =============================================================================
# CONTAINER APP (Bypass RBAC with Admin Credentials)
# =============================================================================

resource "azurerm_container_app" "main" {
  name                         = "ca-${var.container_app_name}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  # Store ACR password in a secret inside the app
  secret {
    name  = "acr-password"
    value = data.azurerm_container_registry.acr.admin_password
  }

  registry {
    server               = data.azurerm_container_registry.acr.login_server
    username             = data.azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-password"
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
    max_replicas = 1
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
