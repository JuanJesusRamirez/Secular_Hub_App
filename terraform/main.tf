# =============================================================================
# ENVIRONMENTS CONFIG
# =============================================================================

locals {
  environments = {
    dev = {
      env                   = "dev"
      location              = "eastus"
      resource_group_name   = "rg-secular-hub-dev-v11"
      container_app_name    = "secular-hub-api-dev-v11"
      acr_name              = "acrsecularhubshared"
      image_tag             = "latest"  # Change as needed
    }
    uat = {
      env                   = "uat"
      location              = "eastus"
      resource_group_name   = "rg-secular-hub-uat-v11"
      container_app_name    = "secular-hub-api-uat-v11"
      acr_name              = "acrsecularhubshared"
      image_tag             = "latest"  # Change as needed
    }
    prd = {
      env                   = "prd"
      location              = "eastus"
      resource_group_name   = "rg-secular-hub-prd-v11"
      container_app_name    = "secular-hub-api-prd-v11"
      acr_name              = "acrsecularhubshared"
      image_tag             = "latest"
    }
  }
}

# =============================================================================
# RESOURCE GROUPS & DATA
# =============================================================================

resource "azurerm_resource_group" "main" {
  for_each = local.environments

  name     = each.value.resource_group_name
  location = each.value.location

  tags = {
    environment = each.key
  }
}

data "azurerm_container_registry" "acr" {
  name                = "acrsecularhubshared"
  resource_group_name = "secular-hub-app-rg"
}

# =============================================================================
# MONITORING
# =============================================================================

resource "azurerm_log_analytics_workspace" "law" {
  for_each = local.environments

  name                = "law-${each.key}"
  location            = azurerm_resource_group.main[each.key].location
  resource_group_name = azurerm_resource_group.main[each.key].name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# =============================================================================
# CONTAINER APP ENVIRONMENT
# =============================================================================

resource "azurerm_container_app_environment" "main" {
  for_each = local.environments

  name                = "cae-${each.value.container_app_name}"
  location            = azurerm_resource_group.main[each.key].location
  resource_group_name = azurerm_resource_group.main[each.key].name
}

# =============================================================================
# CONTAINER APP (Bypass RBAC with Admin Credentials)
# =============================================================================

resource "azurerm_container_app" "main" {
  for_each = local.environments

  name                         = "ca-${each.value.container_app_name}"
  container_app_environment_id = azurerm_container_app_environment.main[each.key].id
  resource_group_name          = azurerm_resource_group.main[each.key].name
  revision_mode                = "Single"

  lifecycle {
    ignore_changes = [
      "template[0].container[0].image",
    ]
  }

  # Store ACR password in a secret inside the app
  secret {
    name  = "acr-password"
    value = data.azurerm_container_registry.acr.admin_password
  }

  secret {
    name  = "database-url"
    value = var.database_url
  }

  registry {
    server               = data.azurerm_container_registry.acr.login_server
    username             = data.azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-password"
  }

  template {
    container {
      name   = "secular-hub"
      image  = "${data.azurerm_container_registry.acr.login_server}/secular-hub:${each.value.image_tag}"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "PORT"
        value = "3000"
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
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
