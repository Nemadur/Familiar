# scripts/get-chat-id.ps1

# 1. Load .env
$scriptPath = $MyInvocation.MyCommand.Path
$rootDir = (Get-Item $scriptPath).Directory.Parent.Parent.FullName
$envPath = Join-Path $rootDir ".env"

if (Test-Path $envPath) {
    Write-Host "Loading environment variables from $envPath" -ForegroundColor Gray
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*([^#=]+?)\s*=\s*(.*)\s*$') {
            $key = $matches[1]
            $value = $matches[2]
            # Remove quotes
            if ($value -match '^"(.*)"$' -or $value -match "^'(.*)'$") { $value = $matches[1] }
            # Set env var
            if (-not (Test-Path "Env:\$key")) { Set-Item "Env:\$key" $value }
        }
    }
}

$botToken = $env:TELEGRAM_BOT_TOKEN
if (-not $botToken) {
    $botToken = Read-Host "Please enter your Telegram Bot Token"
}

$apiUrl = "https://api.telegram.org/bot$botToken/getUpdates"

Write-Host "Fetching updates from Telegram Bot API..." -ForegroundColor Cyan
Write-Host "NOTE: You must have sent a message to the bot (DM) or posted in the channel recently for it to show up here." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Get
    
    if ($response.ok) {
        $updates = $response.result
        
        if ($updates.Count -eq 0) {
            Write-Host "No recent updates found." -ForegroundColor Red
            Write-Host "1. Send a message to your bot in DM."
            Write-Host "2. OR Post a message in your Channel (ensure bot is admin)."
            Write-Host "3. Run this script again."
        } else {
            Write-Host "`nFound the following chats:" -ForegroundColor Green
            foreach ($update in $updates) {
                # Handle different update types (message, channel_post, etc.)
                $msg = $update.message
                if (-not $msg) { $msg = $update.channel_post }
                if (-not $msg) { $msg = $update.edited_message }
                
                if ($msg) {
                    $chat = $msg.chat
                    Write-Host "------------------------------------------------"
                    Write-Host "Type:      $($chat.type)"
                    Write-Host "Title:     $($chat.title)"
                    Write-Host "Username:  $($chat.username)"
                    Write-Host "Chat ID:   $($chat.id)" -ForegroundColor Yellow
                    Write-Host "Text:      $($msg.text)"
                }
            }
            Write-Host "------------------------------------------------"
            Write-Host "`nCopy the 'Chat ID' (including any negative sign) to your .env file."
        }
    } else {
        Write-Error "API returned error: $($response.description)"
    }
}
catch {
    Write-Error "Failed to connect to Telegram API: $_"
}
