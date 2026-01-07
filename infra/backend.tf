terraform {
  backend "azurerm" {
    resource_group_name  = "secular-hub-rg"
    storage_account_name = "secularhubtfstate"
    container_name       = "tfstate"
    key                  = "secular-hub.tfstate"
  }
}
