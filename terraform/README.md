# Terraform — Usage notes

This folder contains the Terraform configuration for the Secular Hub infra.

## Quick: create an isolated/fresh deployment
If you want to create a brand-new set of resources without touching existing ones, either:

- Supply `resource_group_suffix` as a variable when running locally or in CI, e.g. `-var="resource_group_suffix=fresh"`; or
- Create a new workspace (recommended) and deploy there:

  terraform workspace new fresh
  terraform apply -var-file=../envs/dev.tfvars -var="image_tag=..." -var="resource_group_suffix=fresh"

Resources names will use the suffix appended to `resource_group_name`, e.g. `rg-secular-hub-dev-fresh`.

When using a suffix, the Terraform backend key will be stored at the top-level path, e.g. `secular-hub/infra-fresh.tfstate` (and the workflow will use `secular-hub/infra${KEY_SUFFIX}.tfstate`).

## GitHub Actions
This repository's `terraform` workflow supports manual dispatch with an optional `resource_group_suffix` input. When you need to deploy a fresh environment via Actions, use the workflow dispatch input `resource_group_suffix=fresh`.

## Notes
- Using a suffix creates duplicate resources (extra cost).
- Always back up your Terraform state before destructive operations:

  terraform state pull > state-backup.json

