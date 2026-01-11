locals {
  # Effective resource group name used by resources below.
  # If `resource_group_suffix` is empty, use `resource_group_name` as-is;
  # otherwise append a dash and the suffix (e.g. rg-name-fresh).
  rg_name = var.resource_group_suffix == "" ? var.resource_group_name : "${var.resource_group_name}-${var.resource_group_suffix}"
}
