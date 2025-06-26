# Script Setup Apache2 untuk Aplikasi Pajak Next.js (Windows PowerShell)
# Usage: .\setup-apache2.ps1 [install|configure|enable|disable|status]

param(
    [Parameter(Position=0)]
    [ValidateSet("install", "configure", "enable", "disable", "status", "logs", "ssl", "help")]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$LogType = "error"
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Header {
    param([string]$Message)
    Write-Host "[HEADER] $Message" -ForegroundColor Blue
}

# Configuration
$SITE_NAME = "pajak-nextjs"
$APACHE_CONF_DIR = "C:\Apache24\conf"
$CONFIG_FILE = "$APACHE_CONF_DIR\extra\$SITE_NAME.conf"
$HTTPD_CONF = "$APACHE_CONF_DIR\httpd.conf"
$DOMAIN = "iqbaldev.site"

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Function to install Apache2
function Install-Apache2 {
    Write-Header "Installing Apache2 for Windows"
    Write-Host "=================================="
    
    # Check if Apache2 is already installed
    if (Test-Path "C:\Apache24") {
        Write-Warning "Apache2 is already installed at C:\Apache24"
        return
    }
    
    # Download Apache2 for Windows
    Write-Status "Downloading Apache2 for Windows..."
    $apacheUrl = "https://downloads.apache.org/httpd/binaries/win32/httpd-2.4.57-win32-VS16.zip"
    $downloadPath = "$env:TEMP\apache2.zip"
    $extractPath = "C:\"
    
    try {
        Invoke-WebRequest -Uri $apacheUrl -OutFile $downloadPath
        Write-Status "Download completed"
        
        # Extract Apache2
        Write-Status "Extracting Apache2..."
        Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force
        
        # Rename folder to Apache24
        if (Test-Path "C:\httpd-2.4.57-win32-VS16") {
            Rename-Item "C:\httpd-2.4.57-win32-VS16" "Apache24"
        }
        
        Write-Status "Apache2 installed successfully at C:\Apache24"
        
        # Install as Windows service
        Write-Status "Installing Apache2 as Windows service..."
        & "C:\Apache24\bin\httpd.exe" -k install -n "Apache2.4"
        
        Write-Status "Apache2 service installed successfully"
        
    }
    catch {
        Write-Error "Failed to install Apache2: $($_.Exception.Message)"
        exit 1
    }
    finally {
        # Clean up download
        if (Test-Path $downloadPath) {
            Remove-Item $downloadPath -Force
        }
    }
}

# Function to configure Apache2
function Configure-Apache2 {
    Write-Header "Configuring Apache2 for Pajak Next.js"
    Write-Host "=================================="
    
    # Check if Apache2 is installed
    if (-not (Test-Path "C:\Apache24")) {
        Write-Error "Apache2 is not installed. Run 'install' first."
        exit 1
    }
    
    # Check if config file exists
    if (-not (Test-Path "apache2.conf")) {
        Write-Error "apache2.conf file not found in current directory"
        exit 1
    }
    
    # Create extra directory if it doesn't exist
    if (-not (Test-Path "$APACHE_CONF_DIR\extra")) {
        New-Item -ItemType Directory -Path "$APACHE_CONF_DIR\extra" -Force
    }
    
    # Backup existing config if it exists
    if (Test-Path $CONFIG_FILE) {
        Write-Warning "Backing up existing configuration..."
        $backupFile = "$CONFIG_FILE.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Copy-Item $CONFIG_FILE $backupFile
    }
    
    # Copy configuration file
    Write-Status "Installing Apache2 configuration..."
    Copy-Item "apache2.conf" $CONFIG_FILE
    
    # Update main httpd.conf to include our configuration
    $includeLine = "Include conf/extra/$SITE_NAME.conf"
    $httpdContent = Get-Content $HTTPD_CONF
    
    if ($httpdContent -notcontains $includeLine) {
        Write-Status "Adding configuration include to httpd.conf..."
        Add-Content $HTTPD_CONF "`n# Include Pajak Next.js configuration"
        Add-Content $HTTPD_CONF $includeLine
    }
    
    Write-Status "Apache2 configuration installed successfully"
    Write-Status "Domain configured: $DOMAIN/pajakapp"
}

# Function to enable site
function Enable-Site {
    Write-Header "Enabling Apache2 site"
    Write-Host "=================================="
    
    # Check if config file exists
    if (-not (Test-Path $CONFIG_FILE)) {
        Write-Error "Configuration file not found: $CONFIG_FILE"
        Write-Status "Run 'configure' first to install the configuration"
        exit 1
    }
    
    # Test configuration
    Write-Status "Testing Apache2 configuration..."
    $testResult = & "C:\Apache24\bin\httpd.exe" -t 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Configuration test passed"
        
        # Start Apache2 service
        Write-Status "Starting Apache2 service..."
        Start-Service "Apache2.4"
        Set-Service "Apache2.4" -StartupType Automatic
        
        Write-Status "Site enabled successfully!"
        Write-Status "Your application should now be accessible at: https://$DOMAIN/pajakapp"
    }
    else {
        Write-Error "Configuration test failed:"
        Write-Host $testResult
        exit 1
    }
}

# Function to disable site
function Disable-Site {
    Write-Header "Disabling Apache2 site"
    Write-Host "=================================="
    
    # Stop Apache2 service
    Write-Status "Stopping Apache2 service..."
    Stop-Service "Apache2.4" -Force
    
    Write-Status "Site disabled successfully!"
}

# Function to check status
function Get-Status {
    Write-Header "Apache2 Status"
    Write-Host "=================================="
    
    # Check if Apache2 is installed
    if (Test-Path "C:\Apache24") {
        Write-Status "Apache2 is installed at C:\Apache24"
    }
    else {
        Write-Error "Apache2 is not installed"
        return
    }
    
    # Check service status
    $service = Get-Service "Apache2.4" -ErrorAction SilentlyContinue
    if ($service) {
        if ($service.Status -eq "Running") {
            Write-Status "Apache2 service is running"
        }
        else {
            Write-Warning "Apache2 service is not running (Status: $($service.Status))"
        }
    }
    else {
        Write-Error "Apache2 service not found"
    }
    
    # Check configuration
    Write-Status "Testing configuration..."
    $testResult = & "C:\Apache24\bin\httpd.exe" -t 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Configuration is valid"
    }
    else {
        Write-Error "Configuration has errors:"
        Write-Host $testResult
    }
    
    # Show listening ports
    Write-Status "Listening ports:"
    $listeningPorts = netstat -an | Select-String "LISTENING" | Select-String ":80|:443"
    if ($listeningPorts) {
        $listeningPorts | ForEach-Object { Write-Host "  $_" }
    }
    else {
        Write-Host "  No Apache2 ports found"
    }
    
    # Show domain info
    Write-Status "Domain configuration:"
    Write-Host "  Domain: $DOMAIN"
    Write-Host "  Application URL: https://$DOMAIN/pajakapp"
    Write-Host "  Health Check: https://$DOMAIN/pajakapp/health"
}

# Function to show logs
function Show-Logs {
    param([string]$LogType = "error")
    
    $logPath = "C:\Apache24\logs"
    
    switch ($LogType) {
        "error" {
            Write-Header "Apache2 Error Logs"
            if (Test-Path "$logPath\error.log") {
                Get-Content "$logPath\error.log" -Tail 50 -Wait
            }
            else {
                Write-Error "Error log not found"
            }
        }
        "access" {
            Write-Header "Apache2 Access Logs"
            if (Test-Path "$logPath\access.log") {
                Get-Content "$logPath\access.log" -Tail 50 -Wait
            }
            else {
                Write-Error "Access log not found"
            }
        }
        "all" {
            Write-Header "Apache2 All Logs"
            Get-ChildItem "$logPath\*.log" | ForEach-Object {
                Write-Host "=== $($_.Name) ===" -ForegroundColor Yellow
                Get-Content $_.FullName -Tail 20
                Write-Host ""
            }
        }
        default {
            Write-Error "Unknown log type: $LogType"
            Write-Host "Available types: error, access, all"
        }
    }
}

# Function to setup SSL
function Setup-SSL {
    Write-Header "Setting up SSL for Apache2"
    Write-Host "=================================="
    
    Write-Warning "SSL setup for Windows Apache2 requires manual configuration"
    Write-Status "Please follow these steps:"
    Write-Host "1. Obtain SSL certificates for $DOMAIN"
    Write-Host "2. Place certificates in C:\Apache24\conf\ssl\"
    Write-Host "3. Update apache2.conf with SSL configuration"
    Write-Host "4. Uncomment SSL VirtualHost section in apache2.conf"
    Write-Host "5. Restart Apache2 service"
    Write-Host ""
    Write-Host "Domain: $DOMAIN/pajakapp"
}

# Function to show help
function Show-Help {
    Write-Host "Usage: .\setup-apache2.ps1 [install|configure|enable|disable|status|logs|ssl]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  install   - Install Apache2 for Windows"
    Write-Host "  configure - Install Apache2 configuration file"
    Write-Host "  enable    - Enable the Pajak Next.js site"
    Write-Host "  disable   - Disable the Pajak Next.js site"
    Write-Host "  status    - Check Apache2 status and configuration"
    Write-Host "  logs      - Show Apache2 logs (error|access|all)"
    Write-Host "  ssl       - Setup SSL certificate (manual steps)"
    Write-Host "  help      - Show this help message"
    Write-Host ""
    Write-Host "Domain: $DOMAIN/pajakapp"
}

# Main script
function Main {
    if (-not (Test-Administrator)) {
        Write-Error "This script must be run as Administrator"
        exit 1
    }
    
    switch ($Command) {
        "install" {
            Install-Apache2
        }
        "configure" {
            Configure-Apache2
        }
        "enable" {
            Enable-Site
        }
        "disable" {
            Disable-Site
        }
        "status" {
            Get-Status
        }
        "logs" {
            Show-Logs $LogType
        }
        "ssl" {
            Setup-SSL
        }
        "help" {
            Show-Help
        }
        default {
            Write-Error "Unknown command: $Command"
            Show-Help
            exit 1
        }
    }
}

# Run main function
Main 