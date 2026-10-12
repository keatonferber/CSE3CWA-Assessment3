param(
  [string]$JMeter = "jmeter",
  [int]$ConfigId = 1,
  [string]$HostName = "localhost",
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"
$levels = @(1, 10, 100, 1000, 10000)
New-Item -ItemType Directory -Force -Path "$PSScriptRoot/results" | Out-Null

foreach ($users in $levels) {
  $ramp = if ($users -ge 10000) { 120 } elseif ($users -ge 1000) { 60 } elseif ($users -ge 100) { 30 } else { 10 }
  $result = "$PSScriptRoot/results/load-$users.jtl"
  $report = "$PSScriptRoot/results/report-$users"
  Write-Host "Running $users users (ramp $ramp seconds)..."
  & $JMeter -n -t "$PSScriptRoot/load-test.jmx" -Jusers=$users -Jramp=$ramp -JconfigId=$ConfigId -Jhost=$HostName -Jport=$Port -l $result -e -o $report
  if ($LASTEXITCODE -ne 0) { throw "JMeter failed at $users users." }
}

Write-Host "Finished. Open each results/report-*/index.html report and compare response time, throughput and error %."
