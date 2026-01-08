variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "secular-hub"
}

variable "location" {
  description = "Azure location"
  type        = string
  default     = "eastus"
}

variable "resource_group_name" {
  description = "Resource group name"
  type        = string
  default     = "secular-hub-app-rg"
}

variable "app_service_name" {
  description = "Container App name"
  type        = string
  default     = "secular-hub-app"
}

variable "container_registry_name" {
  description = "Container Registry name (must be globally unique, alphanumeric only)"
  type        = string
  default     = "secularhubreg"
}

variable "node_version" {
  description = "Node.js version for Container (example: 18)"
  type        = string
  default     = "18"
}

variable "enable_app_insights" {
  description = "Whether to provision Application Insights"
  type        = bool
  default     = true
}
