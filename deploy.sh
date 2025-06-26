#!/bin/bash

# Script Deployment untuk Aplikasi Pajak Next.js
# Usage: ./deploy.sh [dev|prod]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed."
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_warning "Please update .env file with your configuration before continuing."
            exit 1
        else
            print_error ".env.example not found. Please create .env file manually."
            exit 1
        fi
    fi
}

# Build and start development environment
deploy_dev() {
    print_status "Deploying development environment..."
    
    # Use development Next.js config
    if [ -f "next.config.dev.mjs" ]; then
        print_status "Using development Next.js configuration..."
        cp next.config.dev.mjs next.config.mjs
    fi
    
    # Stop existing containers
    docker-compose down
    
    # Build and start containers
    docker-compose up --build -d
    
    print_status "Development environment deployed successfully!"
    print_status "Application is running at: http://localhost:3000"
    print_status "MongoDB is running at: localhost:27017"
    
    # Restore production config
    if [ -f "next.config.dev.mjs" ]; then
        git checkout next.config.mjs
    fi
}

# Build and start production environment
deploy_prod() {
    print_status "Deploying production environment..."
    
    # Check if production env file exists
    if [ ! -f .env.production ]; then
        print_error ".env.production file not found. Please create it with production configuration."
        exit 1
    fi
    
    # Load production environment variables
    export $(cat .env.production | grep -v '^#' | xargs)
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down
    
    # Build and start containers
    docker-compose -f docker-compose.prod.yml up --build -d
    
    print_status "Production environment deployed successfully!"
    print_status "Application is running at: https://iqbaldev.site/pajakapp"
    print_status "MongoDB is running at: localhost:27017 (internal only)"
}

# Show logs
show_logs() {
    local service=${1:-app}
    print_status "Showing logs for $service..."
    docker-compose logs -f $service
}

# Stop all containers
stop_all() {
    print_status "Stopping all containers..."
    docker-compose down
    docker-compose -f docker-compose.prod.yml down
    print_status "All containers stopped."
}

# Clean up everything
cleanup() {
    print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up..."
        docker-compose down -v --rmi all
        docker-compose -f docker-compose.prod.yml down -v --rmi all
        docker system prune -f
        print_status "Cleanup completed."
    else
        print_status "Cleanup cancelled."
    fi
}

# Main script
main() {
    local command=${1:-dev}
    
    case $command in
        "dev")
            check_docker
            check_env
            deploy_dev
            ;;
        "prod")
            check_docker
            check_env
            deploy_prod
            ;;
        "logs")
            show_logs $2
            ;;
        "stop")
            stop_all
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [dev|prod|logs|stop|cleanup]"
            echo ""
            echo "Commands:"
            echo "  dev     - Deploy development environment (http://localhost:3000)"
            echo "  prod    - Deploy production environment (https://iqbaldev.site/pajakapp)"
            echo "  logs    - Show logs (optional: service name)"
            echo "  stop    - Stop all containers"
            echo "  cleanup - Remove all containers, images, and volumes"
            echo "  help    - Show this help message"
            ;;
        *)
            print_error "Unknown command: $command"
            echo "Use '$0 help' for usage information."
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 