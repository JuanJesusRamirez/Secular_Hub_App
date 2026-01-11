# =============================================================================
# RESOURCE GROUPS
# =============================================================================

# Resource Group específico para este ambiente (dev o uat)
resource "azurerm_resource_group" "main" {
  name     = local.rg_name
  location = var.location
}

# Resource Group compartido (contiene el ACR)
data "azurerm_resource_group" "shared" {
  name = "secular-hub-app-rg"
}


# =============================================================================
# AZURE CONTAINER REGISTRY (ACR) - COMPARTIDO
# =============================================================================

# ACR compartido (creado fuera de este terraform)
# El ACR debe existir en el resource group `secular-hub-app-rg`.
# Ambos ambientes (dev/uat/prod) lo referencian mediante este data source.

data "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = data.azurerm_resource_group.shared.name
}


# =============================================================================
# MONITORING
# =============================================================================

resource "azurerm_log_analytics_workspace" "law" {
  name                = "law-${var.env}${local.name_suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}


# =============================================================================
# CONTAINER APP ENVIRONMENT
# =============================================================================

resource "azurerm_container_app_environment" "main" {
  name                = "cae-${var.container_app_name}-${var.env}${local.name_suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}


# =============================================================================
# IDENTITY
# =============================================================================

resource "azurerm_user_assigned_identity" "containerapp" {
  name                = "id-${var.container_app_name}-${var.env}${local.name_suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}


# =============================================================================
# CONTAINER APP
# =============================================================================

resource "azurerm_container_app" "main" {
  name                         = "ca-${var.container_app_name}-${var.env}${local.name_suffix}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  identity {
    type         = "SystemAssigned, UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.containerapp.id]
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
    identity = azurerm_user_assigned_identity.containerapp.id
  }

  depends_on = [
    azurerm_role_assignment.acr_pull,
    azurerm_user_assigned_identity.containerapp
  ]

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


# =============================================================================
# PERMISOS
# =============================================================================

# Permiso para que el Container App pueda descargar imágenes del ACR
resource "azurerm_role_assignment" "acr_pull" {
  scope                = data.azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.containerapp.principal_id
}
