param(
  $owner = 'JuanJesusRamirez',
  $repo = 'Secular_Hub_App',
  $runId = 20796341809
)

$jobsUrl = "https://api.github.com/repos/$owner/$repo/actions/runs/$runId/jobs"
Write-Output "Fetching jobs for run $runId from $jobsUrl..."

# Prepare headers and include Authorization if GITHUB_TOKEN is provided in environment
$headers = @{ 'User-Agent' = 'GH-Actions-Monitor' }
if ($env:GITHUB_TOKEN -and $env:GITHUB_TOKEN -ne '') {
  $headers['Authorization'] = "token $($env:GITHUB_TOKEN)"
  Write-Output 'Using GITHUB_TOKEN from environment for authenticated API requests.'
}

try {
  $res = Invoke-RestMethod -Uri $jobsUrl -Headers $headers
} catch {
  Write-Output "Failed to call GitHub API: $_"
  exit 2
}

Write-Output "Jobs found: $($res.total_count)"
$res.jobs | Select-Object id,name,status,conclusion | Format-Table -AutoSize

$job = $res.jobs | Where-Object { $_.name -match 'plan|Terraform|terraform' } | Select-Object -First 1
if (-not $job) { $job = $res.jobs[0] }
Write-Output "Selected job: $($job.name) (id $($job.id))"
$logsUrl = $job.logs_url
Write-Output "Logs URL: $logsUrl"

$outDir = Join-Path -Path (Get-Location) -ChildPath ("artifacts\run$runId")
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$zipPath = Join-Path $outDir 'logs.zip'

Write-Output "Downloading logs to $zipPath..."
try {
  Invoke-WebRequest -Uri $logsUrl -OutFile $zipPath -Headers $headers
} catch {
  Write-Output "Failed to download logs: $_"
  exit 3
}

Write-Output 'Expanding logs...'
try {
  Expand-Archive -LiteralPath $zipPath -DestinationPath $outDir -Force
} catch {
  Write-Output "Failed to expand archive: $_"
  exit 4
}

Write-Output 'Listing extracted files:'
Get-ChildItem -Path $outDir -Recurse | Select-Object FullName, Length | Format-Table -AutoSize

$txts = Get-ChildItem -Path $outDir -Recurse -Filter '*.txt'
if ($txts.Count -eq 0) { Write-Output 'No .txt log files found.'; exit 0 }

Write-Output "Searching for error patterns in logs..."
$matches = Select-String -Path ($txts.FullName) -Pattern 'error|failed|FAIL|Traceback' -CaseSensitive:$false -List
if ($matches.Count -eq 0) { Write-Output 'No obvious error lines found. Showing head of first log file for context.'; Write-Output '--- Displaying first 200 lines of first log ---'; Get-Content -Path $txts[0].FullName -TotalCount 200 | ForEach-Object { Write-Output $_ } }
else { foreach ($m in $matches) { Write-Output "--- Match in $($m.Path) line $($m.LineNumber):"; $start = [Math]::Max(1, $m.LineNumber - 5); $end = $m.LineNumber + 5; Get-Content -Path $m.Path | Select-Object -Index ($start-1..($end-1)) | ForEach-Object { Write-Output $_ } } }

Write-Output 'Done.'
