# Backend configured to use an Azure Storage Account container for state.
# The storage account name is intentionally left to be provided at `terraform init` time
# (it's a per-subscription unique name that we bootstrap using `az` in the next step).

terraform {
  backend "azurerm" {
    resource_group_name = "rg-secular-hub-tfstate"
    container_name      = "tfstate"
    key                 = "secular-hub/infra-v7.tfstate"
    # supply `storage_account_name` via `terraform init -backend-config="storage_account_name=<name>"`
  }
} 
