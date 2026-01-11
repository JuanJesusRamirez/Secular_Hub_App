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

variable "container_app_name" {
  type        = string
  description = "Container App name"
}

variable "image_tag" {
  type        = string
  description = "Immutable image tag to deploy (commit SHA)"
}

