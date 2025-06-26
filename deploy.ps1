# Script Deployment untuk Aplikasi Pajak Next.js (Windows PowerShell)
# Usage: .\deploy.ps1 [dev|prod]

param(
    [Parameter(Position=0)]
    [ValidateSet("dev", "prod", "logs", "stop", "cleanup", "help")]
    [string]$Command = "dev",
    
    [Parameter(Position=1)]
    [string]$Service = "app"
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

# Check if Docker is installed
function Test-Docker {
    try {
        $null = Get-Command docker -ErrorAction Stop
        $null = Get-Command docker-compose -ErrorAction Stop
        Write-Status "Docker and Docker Compose are installed."
        return $true
    }
    catch {
        Write-Error "Docker or Docker Compose is not installed. Please install Docker Desktop first."
        return $false
    }
}

# Check if .env file exists
function Test-EnvFile {
    if (-not (Test-Path ".env")) {
        Write-Warning ".env file not found. Creating from .env.example..."
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Warning "Please update .env file with your configuration before continuing."
            exit 1
        }
        else {
            Write-Error ".env.example not found. Please create .env file manually."
            exit 1
        }
    }
}

# Build and start development environment
function Deploy-Dev {
    Write-Status "Deploying development environment..."
    
    # Stop existing containers
    docker-compose down
    
    # Build and start containers
    docker-compose up --build -d
    
    Write-Status "Development environment deployed successfully!"
    Write-Status "Application is running at: http://localhost"
    Write-Status "MongoDB is running at: localhost:27017"
}

# Build and start production environment
function Deploy-Prod {
    Write-Status "Deploying production environment..."
    
    # Check if production env file exists
    if (-not (Test-Path ".env.production")) {
        Write-Error ".env.production file not found. Please create it with production configuration."
        exit 1
    }
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down
    
    # Build and start containers
    docker-compose -f docker-compose.prod.yml up --build -d
    
    Write-Status "Production environment deployed successfully!"
    Write-Status "Application is running at: http://localhost"
    Write-Status "MongoDB is running at: localhost:27017 (internal only)"
}

# Show logs
function Show-Logs {
    param([string]$ServiceName = "app")
    Write-Status "Showing logs for $ServiceName..."
    docker-compose logs -f $ServiceName
}

# Stop all containers
function Stop-All {
    Write-Status "Stopping all containers..."
    docker-compose down
    docker-compose -f docker-compose.prod.yml down
    Write-Status "All containers stopped."
}

# Clean up everything
function Cleanup-All {
    Write-Warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
    $response = Read-Host
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Status "Cleaning up..."
        docker-compose down -v --rmi all
        docker-compose -f docker-compose.prod.yml down -v --rmi all
        docker system prune -f
        Write-Status "Cleanup completed."
    }
    else {
        Write-Status "Cleanup cancelled."
    }
}

# Show help
function Show-Help {
    Write-Host "Usage: .\deploy.ps1 [dev|prod|logs|stop|cleanup]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  dev     - Deploy development environment"
    Write-Host "  prod    - Deploy production environment"
    Write-Host "  logs    - Show logs (optional: service name)"
    Write-Host "  stop    - Stop all containers"
    Write-Host "  cleanup - Remove all containers, images, and volumes"
    Write-Host "  help    - Show this help message"
}

# Main script
function Main {
    if (-not (Test-Docker)) {
        exit 1
    }
    
    switch ($Command) {
        "dev" {
            Test-EnvFile
            Deploy-Dev
        }
        "prod" {
            Test-EnvFile
            Deploy-Prod
        }
        "logs" {
            Show-Logs $Service
        }
        "stop" {
            Stop-All
        }
        "cleanup" {
            Cleanup-All
        }
        "help" {
            Show-Help
        }
        default {
            Write-Error "Unknown command: $Command"
            Write-Host "Use '.\deploy.ps1 help' for usage information."
            exit 1
        }
    }
}

# Run main function
Main 