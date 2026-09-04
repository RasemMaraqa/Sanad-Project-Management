$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"
$pythonPath = Join-Path $backendPath "venv\Scripts\python.exe"

function Find-SanadNode {
    $command = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }

    $fallback = Join-Path $env:ProgramFiles "nodejs\node.exe"
    if (Test-Path -LiteralPath $fallback) { return $fallback }
    return $null
}

function Find-SanadNpmCli([string]$nodePath) {
    if (-not $nodePath) { return $null }
    $candidate = Join-Path (Split-Path -Parent $nodePath) "node_modules\npm\bin\npm-cli.js"
    if (Test-Path -LiteralPath $candidate) { return $candidate }
    return $null
}

function Test-SanadUrl([string]$url) {
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 500
    }
    catch {
        return $false
    }
}

function Wait-ForSanadUrl([string]$url, [string]$label, [int]$attempts = 60) {
    for ($attempt = 0; $attempt -lt $attempts; $attempt++) {
        if (Test-SanadUrl $url) { return }
        Start-Sleep -Seconds 1
    }
    throw "$label did not become ready. See the Troubleshooting section in README.md."
}

function Show-SanadError([string]$message) {
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show(
        $message,
        "Sanad could not start",
        "OK",
        "Error"
    ) | Out-Null
}

function Start-SanadLocal {
    $nodePath = Find-SanadNode
    $npmCliPath = Find-SanadNpmCli $nodePath

    if (-not (Test-Path -LiteralPath $pythonPath)) { return $false }
    if (-not $nodePath -or -not $npmCliPath) { return $false }
    if (-not (Test-Path -LiteralPath (Join-Path $frontendPath "node_modules"))) { return $false }

    if (-not (Test-SanadUrl "http://127.0.0.1:8000/health")) {
        Start-Process -FilePath $pythonPath `
            -ArgumentList @("-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000") `
            -WorkingDirectory $backendPath `
            -WindowStyle Hidden
    }
    Wait-ForSanadUrl "http://127.0.0.1:8000/health" "Sanad API"

    if (-not (Test-SanadUrl "http://127.0.0.1:5173")) {
        $env:VITE_API_URL = "/api"
        Start-Process -FilePath $nodePath `
            -ArgumentList @("`"$npmCliPath`"", "run", "dev") `
            -WorkingDirectory $frontendPath `
            -WindowStyle Hidden
    }
    Wait-ForSanadUrl "http://127.0.0.1:5173" "Sanad frontend"
    Start-Process "http://localhost:5173"
    return $true
}

function Initialize-SanadDockerEnvironment {
    $environmentPath = Join-Path $projectRoot ".env"
    if (Test-Path -LiteralPath $environmentPath) { return }

    $databasePassword = ([guid]::NewGuid().ToString("N")) + ([guid]::NewGuid().ToString("N"))
    $secretKey = ([guid]::NewGuid().ToString("N")) + ([guid]::NewGuid().ToString("N"))
    @(
        "POSTGRES_USER=sanad"
        "POSTGRES_PASSWORD=$databasePassword"
        "POSTGRES_DB=sanad"
        "SECRET_KEY=$secretKey"
        "CORS_ORIGINS=http://localhost:5173,http://localhost:3000"
        "VITE_API_URL=/api"
    ) | Set-Content -LiteralPath $environmentPath -Encoding UTF8
}

function Start-SanadDocker {
    $docker = Get-Command docker.exe -ErrorAction SilentlyContinue
    if (-not $docker) { return $false }

    & $docker.Source info *> $null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Desktop is installed but is not running. Open Docker Desktop, wait until it is ready, then start Sanad again."
    }

    Initialize-SanadDockerEnvironment

    Push-Location $projectRoot
    try {
        & $docker.Source compose up -d --build
        if ($LASTEXITCODE -ne 0) { throw "Docker could not build or start Sanad." }

        & $docker.Source compose exec -T api alembic upgrade head
        if ($LASTEXITCODE -ne 0) { throw "Sanad started, but the database migration failed." }
    }
    finally {
        Pop-Location
    }

    Wait-ForSanadUrl "http://127.0.0.1:3000" "Sanad Docker website" 120
    Start-Process "http://localhost:3000"
    return $true
}

try {
    if (Start-SanadLocal) { exit 0 }
    if (Start-SanadDocker) { exit 0 }

    throw @"
Sanad is not set up on this computer yet.

Easiest setup:
1. Install Docker Desktop.
2. Open Docker Desktop and wait until it is ready.
3. Double-click Start Sanad again.

For a developer setup with Python, Node.js, and PostgreSQL, follow README.md.
"@
}
catch {
    Show-SanadError $_.Exception.Message
    exit 1
}
