resource "azurerm_resource_group" "dev" {
  name     = var.resource_group_name
  location = var.location
}

# Reference to shared resource group for ACR
data "azurerm_resource_group" "shared" {
  name = "secular-hub-app-rg"
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

# Single ACR for the entire project (created only once in shared resource group)
resource "azurerm_container_registry" "acr" {
  count               = var.env == "dev" ? 1 : 0
  name                = var.acr_name
  resource_group_name = data.azurerm_resource_group.shared.name
  location            = data.azurerm_resource_group.shared.location
  sku                 = "Standard"
  admin_enabled       = true
}

# Data source to reference existing ACR in non-dev environments
data "azurerm_container_registry" "acr_ref" {
  count               = var.env != "dev" ? 1 : 0
  name                = var.acr_name
  resource_group_name = data.azurerm_resource_group.shared.name
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

  registry {
    server               = azurerm_container_registry.acr.login_server
    username             = azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-admin-password"
  }

  secret {
    name  = "acr-admin-password"
    value = azurerm_container_registry.acr.admin_password
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
