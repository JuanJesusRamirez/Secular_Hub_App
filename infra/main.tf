# =============================================================================
# Resource Group (shared)
# =============================================================================
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

# =============================================================================
# UAT Environment
# =============================================================================
resource "azurerm_container_registry" "acr_uat" {
  name                = "${var.container_registry_name}uat"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_container_app_environment" "env_uat" {
  name                = "${var.project_name}-env-uat"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_container_app" "app_uat" {
  name                         = "${var.app_service_name}-uat"
  container_app_environment_id = azurerm_container_app_environment.env_uat.id
  resource_group_name          = azurerm_resource_group.rg.name
  revision_mode                = "Single"

  template {
    container {
      name   = "secular-hub"
      image  = "${azurerm_container_registry.acr_uat.login_server}/secular-hub-app:uat"
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

  registry {
    server               = azurerm_container_registry.acr_uat.login_server
    username             = azurerm_container_registry.acr_uat.admin_username
    password_secret_name = "acr-password-uat"
  }

  secret {
    name  = "acr-password-uat"
    value = azurerm_container_registry.acr_uat.admin_password
  }

  depends_on = [azurerm_container_app_environment.env_uat]
}

# =============================================================================
# PRD Environment
# =============================================================================
resource "azurerm_container_registry" "acr_prd" {
  name                = "${var.container_registry_name}prd"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_container_app_environment" "env_prd" {
  name                = "${var.project_name}-env-prd"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_container_app" "app_prd" {
  name                         = "${var.app_service_name}-prd"
  container_app_environment_id = azurerm_container_app_environment.env_prd.id
  resource_group_name          = azurerm_resource_group.rg.name
  revision_mode                = "Single"

  template {
    container {
      name   = "secular-hub"
      image  = "${azurerm_container_registry.acr_prd.login_server}/secular-hub-app:prd"
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

  registry {
    server               = azurerm_container_registry.acr_prd.login_server
    username             = azurerm_container_registry.acr_prd.admin_username
    password_secret_name = "acr-password-prd"
  }

  secret {
    name  = "acr-password-prd"
    value = azurerm_container_registry.acr_prd.admin_password
  }

  depends_on = [azurerm_container_app_environment.env_prd]
}

# =============================================================================
# Shared: Application Insights (optional)
# =============================================================================
resource "azurerm_application_insights" "ai" {
  count               = var.enable_app_insights ? 1 : 0
  name                = "${var.project_name}-ai"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  application_type    = "web"
}

