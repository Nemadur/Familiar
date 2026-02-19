# scripts/export.ps1

# 1. Configuration
$projectName = "familiar"
$timestamp = Get-Date -Format "yyyy/MM/dd-HH:mm:ss"
$zipName = "$projectName-export-$timestamp.zip"
$scriptPath = $MyInvocation.MyCommand.Path
$rootDir = (Get-Item $scriptPath).Directory.Parent.Parent.FullName
$outputPath = Join-Path $rootDir $zipName
$envPath = Join-Path $rootDir ".env"

# Load .env file manually if it exists
if (Test-Path $envPath) {
    Write-Host "Loading environment variables from $envPath" -ForegroundColor Gray
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*([^#=]+?)\s*=\s*(.*)\s*$') {
            $key = $matches[1]
            $value = $matches[2]
            # Remove quotes if present
            if ($value -match '^"(.*)"$' -or $value -match "^'(.*)'$") {
                $value = $matches[1]
            }
            # Always set/overwrite environment variables from .env to ensure file is source of truth
            Set-Item "Env:\$key" $value
        }
    }
}

# Telegram Configuration (Try env vars first, then prompt)
$botToken = $env:TELEGRAM_BOT_TOKEN
$chatId = $env:TELEGRAM_CHAT_ID

if (-not $botToken) {
    Write-Host "Telegram Bot Token not found in environment variables." -ForegroundColor Yellow
    $botToken = Read-Host "Please enter your Telegram Bot Token"
}

if (-not $chatId) {
    Write-Host "Telegram Chat ID not found in environment variables." -ForegroundColor Yellow
    $chatId = Read-Host "Please enter your Telegram Chat ID"
}

# Debug: Show what we are using (partially masked)
if ($chatId) {
    $maskedChatId = if ($chatId.Length -gt 4) { $chatId.Substring(0, 4) + "****" } else { "****" }
    Write-Host "Using Chat ID: $maskedChatId" -ForegroundColor Gray
}

if (-not $botToken -or -not $chatId) {
    Write-Error "Missing Telegram credentials. Aborting."
    exit 1
}

# 2. Define exclusions (folders and files to skip)
$excludeList = @(
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    ".vscode",
    "coverage",
    "*.zip",
    "*.log",
    ".env",
    ".env.*" # careful not to export secrets
)

Write-Host "Preparing to zip project from: $rootDir"
Write-Host "Output file: $outputPath"

# 3. Zip the project
# Use a temporary directory to copy files first, avoiding file locking issues (like bun.lock)
try {
    Write-Host "Creating temporary staging directory..." -ForegroundColor Cyan
    $tempDir = Join-Path ([System.IO.Path]::GetTempPath()) "familiar-export-$timestamp"
    if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

    Write-Host "Copying files to staging area..." -ForegroundColor Cyan

    # Helper function to safely copy files that might be locked
    function Copy-Safe {
        param($Source, $Destination)
        try {
            Copy-Item -Path $Source -Destination $Destination -Force -ErrorAction Stop
        }
        catch {
            # If standard copy fails (likely due to lock), try reading with FileShare.ReadWrite
            try {
                $fileStream = [System.IO.File]::Open($Source, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
                $destStream = [System.IO.File]::Create($Destination)
                $fileStream.CopyTo($destStream)
                $destStream.Close()
                $fileStream.Close()
                Write-Host "  [Locked] Copied safely: $(Split-Path $Source -Leaf)" -ForegroundColor Yellow
            }
            catch {
                Write-Warning "  [Skipped] Could not copy locked file: $(Split-Path $Source -Leaf)"
            }
        }
    }

    # Get items to copy, excluding the exclude list
    $items = Get-ChildItem -Path $rootDir -Exclude $excludeList -Force | Where-Object {
        $name = $_.Name
        $isExcluded = $false
        foreach ($ex in $excludeList) {
            if ($name -like $ex) { $isExcluded = $true; break }
        }
        -not $isExcluded
    }

    foreach ($item in $items) {
        $destPath = Join-Path $tempDir $item.Name
        if ($item.PSIsContainer) {
            try {
                Copy-Item -Path $item.FullName -Destination $destPath -Recurse -Force -ErrorAction Stop
            }
            catch {
                 Write-Warning "  [Partial] Could not fully copy directory: $($item.Name). Some files might be locked."
            }
        } else {
            Copy-Safe -Source $item.FullName -Destination $destPath
        }
    }

    Write-Host "Compressing files from staging..." -ForegroundColor Cyan
    Compress-Archive -Path "$tempDir\*" -DestinationPath $outputPath -Force

    Write-Host "Zip created successfully: $zipName" -ForegroundColor Green

    # Cleanup temp
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}
catch {
    Write-Error "Failed to create zip file: $_"
    exit 1
}

# 4. Send to Telegram
$apiUrl = "https://api.telegram.org/bot$botToken/sendDocument"

Write-Host "Sending to Telegram..." -ForegroundColor Cyan

# Check if curl is available (standard on Windows 10+)
    if (Get-Command "curl.exe" -ErrorAction SilentlyContinue) {
        # Use curl.exe (more reliable for multipart form data in PS 5.1)
        # -s for silent, capture output
        $curlOutput = curl.exe -s -F chat_id=$chatId -F document=@"$outputPath" $apiUrl

        # Try to parse JSON output to check for "ok": true
        try {
            # Clean up output if needed (sometimes curl adds progress even with -s if redirected wrong, but here we capture)
            $json = $curlOutput | ConvertFrom-Json

            if ($json.ok -eq $true) {
                Write-Host "`nExport sent to Telegram successfully!" -ForegroundColor Green
            } else {
                Write-Error "Telegram API Error: $($json.description) (Error Code: $($json.error_code))"
                exit 1
            }
        }
        catch {
            # Fallback if JSON parsing fails but curl exit code was 0
            if ($LASTEXITCODE -eq 0) {
                 Write-Host "`nExport sent to Telegram (Unverified response: $curlOutput)" -ForegroundColor Yellow
            } else {
                 Write-Error "Failed to send to Telegram via curl. Output: $curlOutput"
                 exit 1
            }
        }
    }
else {
    # Fallback for PS 5.1 without curl (MultipartFormDataContent)
    try {
        Add-Type -AssemblyName 'System.Net.Http'
        $client = New-Object System.Net.Http.HttpClient
        $content = New-Object System.Net.Http.MultipartFormDataContent
        $fileStream = [System.IO.File]::OpenRead($outputPath)
        $fileContent = New-Object System.Net.Http.StreamContent($fileStream)
        $content.Add($fileContent, "document", $zipName)
        $content.Add((New-Object System.Net.Http.StringContent($chatId)), "chat_id")

        $result = $client.PostAsync($apiUrl, $content).Result
        $result.EnsureSuccessStatusCode()

        $fileStream.Close()
        Write-Host "Export sent to Telegram successfully!" -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to send to Telegram via .NET: $_"
        if ($fileStream) { $fileStream.Close() }
    }
}

# Cleanup (optional - ask user?)
# Remove-Item $outputPath
