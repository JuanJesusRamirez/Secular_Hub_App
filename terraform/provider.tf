terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 3.0"
    }
    null = {
      source  = "hashicorp/null"
      version = ">= 3.0"
    }
  }
  required_version = ">= 1.0"
}

provider "azurerm" {
  features {}
}

# Use the current Azure CLI / Managed Identity credentials. No hard-coded credentials here.
# Ensure you've run `az login` (or are using an appropriate service principal) before `terraform apply`.
