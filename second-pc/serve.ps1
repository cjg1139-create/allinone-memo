# Second PC site - local web server (no install needed, uses Windows PowerShell only)
# Usage: run  .\serve.ps1  then open http://localhost:5100 in your browser. Stop: Ctrl + C
# NOTE: keep this file English-only. Windows PowerShell 5.1 can misread Korean in .ps1 files.
param([int]$Port = 5100)
# if the host app gives a PORT environment variable, use it
if ($env:PORT) { $Port = [int]$env:PORT }

$root = $PSScriptRoot
$mime = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
  '.js' = 'application/javascript; charset=utf-8'; '.json' = 'application/json; charset=utf-8'
  '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.svg' = 'image/svg+xml'; '.ico' = 'image/x-icon'
  '.md' = 'text/plain; charset=utf-8'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Server running at http://localhost:$Port (stop: Ctrl + C)"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    # try/catch so one bad request never stops the server
    try {
      $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
      if ($path -eq '/') { $path = '/index.html' }
      # block access outside this folder (no .. tricks)
      $file = [System.IO.Path]::GetFullPath((Join-Path $root $path.TrimStart('/')))
      $name = [System.IO.Path]::GetFileName($file)
      $isPrivate = ($name -eq 'serve.ps1') -or ($name -like '*.bat')
      if ($file.StartsWith($root) -and (Test-Path $file -PathType Leaf) -and -not $isPrivate) {
        $ext = [System.IO.Path]::GetExtension($file).ToLower()
        if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] } else { $ctx.Response.ContentType = 'application/octet-stream' }
        $ctx.Response.Headers.Add('Cache-Control', 'no-cache')
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $ctx.Response.ContentLength64 = $bytes.Length
        # HEAD requests only ask for headers, so send no body
        if ($ctx.Request.HttpMethod -ne 'HEAD') {
          $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
      } else {
        $ctx.Response.StatusCode = 404
      }
    } catch {
      Write-Host ("Request error: " + $_.Exception.Message)
    } finally {
      try { $ctx.Response.Close() } catch { }
    }
  }
} finally {
  $listener.Stop()
}
