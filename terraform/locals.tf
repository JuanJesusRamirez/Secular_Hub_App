locals {
  # Suffix appended to resource names when a resource_group_suffix is provided.
  # Example: if suffix = "fresh", name_suffix = "-fresh", otherwise empty string.
  name_suffix = var.resource_group_suffix == "" ? "" : "-${var.resource_group_suffix}"

  # Effective resource group name used by resources below.
  rg_name = var.resource_group_suffix == "" ? var.resource_group_name : "${var.resource_group_name}${local.name_suffix}"
}
