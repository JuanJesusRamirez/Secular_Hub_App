resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_container_registry" "acr" {
  name                = var.container_registry_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_container_registry" "acr_dev" {
  name                = var.container_registry_name_dev
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_container_app_environment" "env" {
  name                = "${var.project_name}-env"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_container_app_environment" "env_dev" {
  name                = "${var.project_name}-env-dev"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_container_app" "app_prd" {
  name                         = "${var.app_service_name}-prd"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = azurerm_resource_group.rg.name
  revision_mode                = "Single"

  template {
    container {
      name   = "secular-hub"
      image  = "${azurerm_container_registry.acr.login_server}/secular-hub-app:prod"
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
    server               = azurerm_container_registry.acr.login_server
    username             = azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-password-prd"
  }

  secret {
    name  = "acr-password-prd"
    value = azurerm_container_registry.acr.admin_password
  }

  depends_on = [azurerm_container_app_environment.env]
}

resource "azurerm_container_app" "app_uat" {
  name                         = "${var.app_service_name}-uat"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = azurerm_resource_group.rg.name
  revision_mode                = "Single"

  template {
    container {
      name   = "secular-hub"
      image  = "${azurerm_container_registry.acr.login_server}/secular-hub-app:uat"
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
    server               = azurerm_container_registry.acr.login_server
    username             = azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-password-uat"
  }

  secret {
    name  = "acr-password-uat"
    value = azurerm_container_registry.acr.admin_password
  }

  depends_on = [azurerm_container_app_environment.env]
}

resource "azurerm_container_app" "app_dev" {
  name                         = "${var.app_service_name}-dev"
  container_app_environment_id = azurerm_container_app_environment.env_dev.id
  resource_group_name          = azurerm_resource_group.rg.name
  revision_mode                = "Single"

  template {
    container {
      name   = "secular-hub"
      image  = "${azurerm_container_registry.acr_dev.login_server}/secular-hub-app:dev"
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
    server               = azurerm_container_registry.acr_dev.login_server
    username             = azurerm_container_registry.acr_dev.admin_username
    password_secret_name = "acr-password-dev"
  }

  secret {
    name  = "acr-password-dev"
    value = azurerm_container_registry.acr_dev.admin_password
  }

  depends_on = [azurerm_container_app_environment.env_dev]
}

data "azurerm_role_definition" "acr_push" {
  name = "AcrPush"
}

resource "azurerm_role_assignment" "sp_acr_dev" {
  count              = length(trimspace(var.service_principal_object_id)) > 0 ? 1 : 0
  scope              = azurerm_container_registry.acr_dev.id
  role_definition_id = data.azurerm_role_definition.acr_push.id
  principal_id       = var.service_principal_object_id
}

resource "azurerm_application_insights" "ai" {
  count               = var.enable_app_insights ? 1 : 0
  name                = "${var.project_name}-ai"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  application_type    = "web"
}

output "uat_fqdn" {
  value = azurerm_container_app.app_uat.latest_revision_fqdn
}

output "prd_fqdn" {
  value = azurerm_container_app.app_prd.latest_revision_fqdn
}
