resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_service_plan" "asp" {
  name                = var.app_service_plan_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Windows"
  sku_name            = var.sku_size
}

resource "azurerm_windows_web_app" "app" {
  name                = var.app_service_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.asp.id

  site_config {
    application_stack {
      node_version = "~18"
    }
    always_on         = false
    use_32_bit_worker = false
  }

  app_settings = {
    "WEBSITE_RUN_FROM_PACKAGE"       = "1"
    "WEBSITE_NODE_DEFAULT_VERSION"   = var.node_version
    "PORT"                           = "3000"
    "SCM_DO_BUILD_DURING_DEPLOYMENT" = "false"
  }

  depends_on = [azurerm_service_plan.asp]
}

resource "azurerm_application_insights" "ai" {
  count               = var.enable_app_insights ? 1 : 0
  name                = "${var.project_name}-ai"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  application_type    = "web"
}
