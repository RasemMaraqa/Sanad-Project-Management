param([switch]$Quiet)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$launcherPath = Join-Path $projectRoot "Start Sanad.cmd"

try {
    if (-not (Test-Path -LiteralPath $launcherPath)) {
        throw "Start Sanad.cmd was not found. Keep the complete downloaded Sanad folder together."
    }

    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = Join-Path $desktopPath "Sanad Project Manager.lnk"
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $launcherPath
    $shortcut.WorkingDirectory = $projectRoot
    $shortcut.Description = "Start Sanad Project Management"
    $shortcut.Save()

    if (-not $Quiet) {
        Add-Type -AssemblyName PresentationFramework
        [System.Windows.MessageBox]::Show(
            "The Sanad launcher was added to your Desktop. Double-click it whenever you want to use Sanad.",
            "Sanad is ready",
            "OK",
            "Information"
        ) | Out-Null
    }
}
catch {
    if (-not $Quiet) {
        Add-Type -AssemblyName PresentationFramework
        [System.Windows.MessageBox]::Show($_.Exception.Message, "Shortcut installation failed", "OK", "Error") | Out-Null
    }
    throw
}
