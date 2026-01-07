param(
  $owner = 'JuanJesusRamirez',
  $repo = 'Secular_Hub_App',
  $branch = 'feature/terraform-infrastructure',
  $interval = 10,
  $maxAttempts = 60
)

$url = "https://api.github.com/repos/$owner/$repo/actions/runs?branch=$branch"
$i = 0
while ($i -lt $maxAttempts) {
  $i++
  try {
    $res = Invoke-RestMethod -Uri $url -Headers @{ 'User-Agent' = 'GH-Actions-Monitor' }
  } catch {
    Write-Output "Error calling GitHub API: $_"
    exit 2
  }

  if ($res.total_count -gt 0) {
    $run = $res.workflow_runs | Sort-Object created_at -Descending | Select-Object -First 1
    Write-Output "Run found: ID=$($run.id) Name=$($run.name) Event=$($run.event) HeadBranch=$($run.head_branch) Status=$($run.status) Conclusion=$($run.conclusion) URL=$($run.html_url)"
    if ($run.status -eq 'completed') {
      if ($run.conclusion -eq 'success') {
        Write-Output "Run completed successfully."
        exit 0
      } else {
        Write-Output "Run completed with conclusion: $($run.conclusion)"
        exit 0
      }
    }
  } else {
    Write-Output "No workflow runs found yet for branch $branch."
  }

  Start-Sleep -Seconds $interval
}

Write-Output "Timeout waiting for run to complete after $($interval * $maxAttempts) seconds."
exit 3
