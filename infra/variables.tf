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
  default     = "secular-hub-rg"
}

variable "app_service_plan_name" {
  description = "App Service Plan name"
  type        = string
  default     = "secular-hub-plan"
}

variable "app_service_name" {
  description = "App Service (WebApp) name"
  type        = string
  default     = "secular-hub-app"
}

variable "sku_tier" {
  description = "App Service plan tier"
  type        = string
  default     = "Standard"
}

variable "sku_size" {
  description = "App Service plan size"
  type        = string
  default     = "S1"
}

variable "node_version" {
  description = "Node.js version for App Service (example: 18.x)"
  type        = string
  default     = "18.x"
}

variable "enable_app_insights" {
  description = "Whether to provision Application Insights"
  type        = bool
  default     = true
}
