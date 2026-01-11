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

variable "resource_group_suffix" {
  type        = string
  description = "Optional suffix appended to the resource group name to create isolated deployments (e.g. 'fresh')"
  default     = ""
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

variable "override_image" {
  type        = string
  description = "Full image reference to use instead of the ACR image (use a public image for the initial bootstrap). If empty, the image from the ACR will be used."
  default     = ""
}
