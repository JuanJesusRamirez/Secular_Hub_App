resource "azurerm_resource_group" "dev" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_log_analytics_workspace" "law" {
  name                = "law-${var.env}"
  location            = azurerm_resource_group.dev.location
  resource_group_name = azurerm_resource_group.dev.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_container_app_environment" "env_dev" {
  name                = "cae-${var.container_app_name}-${var.env}"
  location            = azurerm_resource_group.dev.location
  resource_group_name = azurerm_resource_group.dev.name
}

# Single ACR for the entire project (not per-environment)
resource "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.dev.name
  location            = azurerm_resource_group.dev.location
  sku                 = "Standard"
  admin_enabled       = true
}

resource "azurerm_container_app" "app_dev" {
  name                         = "ca-${var.container_app_name}-${var.env}"
  container_app_environment_id = azurerm_container_app_environment.env_dev.id
  resource_group_name          = azurerm_resource_group.dev.name
  revision_mode                = "Single"

  identity {
    type = "SystemAssigned"
  }

  template {
    container {
      name   = "secular-hub"
      image  = "${azurerm_container_registry.acr.login_server}/secular-hub:${var.image_tag}"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "PORT"
        value = "3000"
      }
    }
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

# Assign AcrPull role to Container App's Managed Identity
resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_container_app.app_dev.identity[0].principal_id

  depends_on = [azurerm_container_app.app_dev, azurerm_container_registry.acr]
}

# Set min/max replicas via az CLI (post-provisioning)
resource "null_resource" "set_scale" {
  provisioner "local-exec" {
    command = "az containerapp update -n ${azurerm_container_app.app_dev.name} -g ${azurerm_resource_group.dev.name} --set template.scale.minReplicas=1 template.scale.maxReplicas=3"
  }

  triggers = {
    image_tag = var.image_tag
  }

  depends_on = [azurerm_container_app.app_dev]
}
