variable "image_tag" {
  type        = string
  description = "Immutable image tag to deploy (commit SHA)"
  default     = "latest"
}

variable "database_url" {
  type        = string
  description = "Database connection string (secret)"
  sensitive   = true
}

