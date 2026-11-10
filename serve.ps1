# Minimal static file server for local preview (no Node/Python required).
# Usage:  powershell -ExecutionPolicy Bypass -File serve.ps1 [-Port 8080]
param([int]$Port = 8080)
$root = $PSScriptRoot
$mime = @{ ".html"="text/html; charset=utf-8"; ".css"="text/css"; ".js"="application/javascript"; ".svg"="image/svg+xml"; ".png"="image/png"; ".jpg"="image/jpeg"; ".webp"="image/webp"; ".ico"="image/x-icon"; ".json"="application/json" }
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Vocal Crest preview running at http://localhost:$Port/"
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart("/")
  # Local-testing-only form endpoints (set VC_CONFIG.form.endpoint to "/__dev/form-ok" or "/__dev/form-fail")
  if ($ctx.Request.HttpMethod -eq "POST" -and $path -like "__dev/*") {
    Start-Sleep -Milliseconds 700
    $ctx.Response.StatusCode = $(if ($path -eq "__dev/form-ok") { 200 } else { 500 })
    $ctx.Response.ContentType = "application/json"
    $b = [Text.Encoding]::UTF8.GetBytes('{"ok":' + $(if ($path -eq "__dev/form-ok") { "true" } else { "false" }) + '}')
    $ctx.Response.OutputStream.Write($b, 0, $b.Length); $ctx.Response.Close(); continue
  }
  $file = Join-Path $root $path
  if ((Test-Path $file -PathType Container) -or $path -eq "") { $file = Join-Path $file "index.html" }
  if (Test-Path $file -PathType Leaf) {
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $ctx.Response.ContentType = $(if ($mime[$ext]) { $mime[$ext] } else { "application/octet-stream" })
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $ctx.Response.StatusCode = 404
  }
  $ctx.Response.Close()
}