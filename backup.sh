#!/bin/bash

# Script Backup untuk Database MongoDB
# Usage: ./backup.sh [backup|restore]

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

# Configuration
BACKUP_DIR="./backups"
MONGO_CONTAINER="pajak-mongodb-prod"
DB_NAME="pajak_db"
MONGO_USER="admin"
MONGO_PASSWORD="password123"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to create backup
create_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/backup_$timestamp"
    
    print_status "Creating backup: $backup_file"
    
    # Check if container is running
    if ! docker ps | grep -q "$MONGO_CONTAINER"; then
        print_error "MongoDB container is not running. Please start the application first."
        exit 1
    fi
    
    # Create backup
    docker exec "$MONGO_CONTAINER" mongodump \
        --username="$MONGO_USER" \
        --password="$MONGO_PASSWORD" \
        --authenticationDatabase=admin \
        --db="$DB_NAME" \
        --out="/data/backup_$timestamp"
    
    # Copy backup from container to host
    docker cp "$MONGO_CONTAINER:/data/backup_$timestamp" "$backup_file"
    
    # Clean up backup from container
    docker exec "$MONGO_CONTAINER" rm -rf "/data/backup_$timestamp"
    
    # Compress backup
    tar -czf "$backup_file.tar.gz" -C "$backup_file" .
    rm -rf "$backup_file"
    
    print_status "Backup created successfully: $backup_file.tar.gz"
    
    # Keep only last 10 backups
    ls -t "$BACKUP_DIR"/backup_*.tar.gz | tail -n +11 | xargs -r rm
    
    print_status "Old backups cleaned up (keeping last 10)"
}

# Function to restore backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify backup file to restore"
        echo "Usage: $0 restore <backup_file.tar.gz>"
        echo "Available backups:"
        ls -la "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null || echo "No backups found"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_warning "This will overwrite the current database. Are you sure? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Restore cancelled."
        exit 0
    fi
    
    print_status "Restoring backup: $backup_file"
    
    # Check if container is running
    if ! docker ps | grep -q "$MONGO_CONTAINER"; then
        print_error "MongoDB container is not running. Please start the application first."
        exit 1
    fi
    
    # Extract backup
    local temp_dir=$(mktemp -d)
    tar -xzf "$backup_file" -C "$temp_dir"
    
    # Copy backup to container
    docker cp "$temp_dir" "$MONGO_CONTAINER:/data/restore_temp"
    
    # Restore database
    docker exec "$MONGO_CONTAINER" mongorestore \
        --username="$MONGO_USER" \
        --password="$MONGO_PASSWORD" \
        --authenticationDatabase=admin \
        --db="$DB_NAME" \
        --drop \
        "/data/restore_temp"
    
    # Clean up
    docker exec "$MONGO_CONTAINER" rm -rf "/data/restore_temp"
    rm -rf "$temp_dir"
    
    print_status "Backup restored successfully!"
}

# Function to list backups
list_backups() {
    print_status "Available backups:"
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A "$BACKUP_DIR")" ]; then
        ls -lah "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | while read -r line; do
            echo "  $line"
        done
    else
        echo "  No backups found"
    fi
}

# Function to show backup info
backup_info() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify backup file"
        echo "Usage: $0 info <backup_file.tar.gz>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_status "Backup information for: $backup_file"
    echo "  Size: $(du -h "$backup_file" | cut -f1)"
    echo "  Created: $(stat -c %y "$backup_file")"
    
    # Extract and show database info
    local temp_dir=$(mktemp -d)
    tar -xzf "$backup_file" -C "$temp_dir" --strip-components=1
    
    if [ -f "$temp_dir/$DB_NAME.metadata.json" ]; then
        echo "  Database: $DB_NAME"
        echo "  Collections:"
        ls "$temp_dir"/*.bson 2>/dev/null | while read -r collection; do
            local collection_name=$(basename "$collection" .bson)
            echo "    - $collection_name"
        done
    fi
    
    rm -rf "$temp_dir"
}

# Main script
main() {
    local command=${1:-backup}
    
    case $command in
        "backup")
            create_backup
            ;;
        "restore")
            restore_backup "$2"
            ;;
        "list")
            list_backups
            ;;
        "info")
            backup_info "$2"
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [backup|restore|list|info]"
            echo ""
            echo "Commands:"
            echo "  backup [default] - Create a new backup"
            echo "  restore <file>   - Restore from backup file"
            echo "  list             - List available backups"
            echo "  info <file>      - Show backup information"
            echo "  help             - Show this help message"
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