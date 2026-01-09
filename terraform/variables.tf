variable "env" {
  type        = string
  description = "Environment name (dev)"
}

variable "location" {
  type        = string
  description = "Azure location"
}

variable "resource_group_name" {
  type        = string
  description = "Resource Group for DEV resources"
}

variable "acr_name" {
  type        = string
  description = "Name for the Azure Container Registry (must be globally unique)"
}

variable "container_app_name" {
  type        = string
  description = "Container App name"
}

variable "image_tag" {
  type        = string
  description = "Immutable image tag to deploy (commit SHA)"
}
