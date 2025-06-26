#!/bin/bash

# Script Setup Apache2 untuk Aplikasi Pajak Next.js
# Usage: ./setup-apache2.sh [install|configure|enable|disable|status]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}[HEADER]${NC} $1"
}

# Configuration
SITE_NAME="pajak-nextjs"
CONFIG_FILE="/etc/apache2/sites-available/$SITE_NAME.conf"
ENABLED_FILE="/etc/apache2/sites-enabled/$SITE_NAME.conf"
DOMAIN="iqbaldev.site"

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Function to install Apache2
install_apache2() {
    print_header "Installing Apache2 and required modules"
    echo "=================================="
    
    # Update package list
    apt update
    
    # Install Apache2
    apt install -y apache2
    
    # Enable required modules
    print_status "Enabling required Apache2 modules..."
    a2enmod proxy
    a2enmod proxy_http
    a2enmod headers
    a2enmod rewrite
    a2enmod ssl
    a2enmod deflate
    a2enmod expires
    
    # Optional: Enable rate limiting (if available)
    if apache2ctl -M | grep -q ratelimit; then
        a2enmod ratelimit
        print_status "Rate limiting module enabled"
    else
        print_warning "Rate limiting module not available"
    fi
    
    # Restart Apache2
    systemctl restart apache2
    systemctl enable apache2
    
    print_status "Apache2 installed and configured successfully"
}

# Function to configure Apache2
configure_apache2() {
    print_header "Configuring Apache2 for Pajak Next.js"
    echo "=================================="
    
    # Check if config file exists
    if [ ! -f "apache2.conf" ]; then
        print_error "apache2.conf file not found in current directory"
        exit 1
    fi
    
    # Backup existing config if it exists
    if [ -f "$CONFIG_FILE" ]; then
        print_warning "Backing up existing configuration..."
        cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Copy configuration file
    print_status "Installing Apache2 configuration..."
    cp apache2.conf "$CONFIG_FILE"
    
    # Set proper permissions
    chmod 644 "$CONFIG_FILE"
    chown root:root "$CONFIG_FILE"
    
    print_status "Apache2 configuration installed successfully"
    print_status "Domain configured: $DOMAIN/pajakapp"
}

# Function to enable site
enable_site() {
    print_header "Enabling Apache2 site"
    echo "=================================="
    
    # Check if config file exists
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Configuration file not found: $CONFIG_FILE"
        print_status "Run 'configure' first to install the configuration"
        exit 1
    fi
    
    # Disable default site if it exists
    if [ -f "/etc/apache2/sites-enabled/000-default.conf" ]; then
        print_warning "Disabling default Apache2 site..."
        a2dissite 000-default
    fi
    
    # Enable our site
    print_status "Enabling Pajak Next.js site..."
    a2ensite "$SITE_NAME"
    
    # Test configuration
    print_status "Testing Apache2 configuration..."
    if apache2ctl configtest; then
        print_status "Configuration test passed"
        
        # Restart Apache2
        print_status "Restarting Apache2..."
        systemctl restart apache2
        
        print_status "Site enabled successfully!"
        print_status "Your application should now be accessible at: https://$DOMAIN/pajakapp"
    else
        print_error "Configuration test failed. Please check the configuration file."
        exit 1
    fi
}

# Function to disable site
disable_site() {
    print_header "Disabling Apache2 site"
    echo "=================================="
    
    # Disable our site
    print_status "Disabling Pajak Next.js site..."
    a2dissite "$SITE_NAME"
    
    # Re-enable default site
    print_status "Re-enabling default Apache2 site..."
    a2ensite 000-default
    
    # Restart Apache2
    print_status "Restarting Apache2..."
    systemctl restart apache2
    
    print_status "Site disabled successfully!"
}

# Function to check status
check_status() {
    print_header "Apache2 Status"
    echo "=================================="
    
    # Check if Apache2 is running
    if systemctl is-active --quiet apache2; then
        print_status "Apache2 is running"
    else
        print_error "Apache2 is not running"
    fi
    
    # Check if site is enabled
    if [ -L "$ENABLED_FILE" ]; then
        print_status "Pajak Next.js site is enabled"
    else
        print_warning "Pajak Next.js site is not enabled"
    fi
    
    # Check enabled modules
    print_status "Enabled modules:"
    apache2ctl -M | grep -E "(proxy|headers|rewrite|ssl|deflate|expires)" || echo "  No required modules found"
    
    # Check configuration
    print_status "Configuration test:"
    if apache2ctl configtest; then
        print_status "Configuration is valid"
    else
        print_error "Configuration has errors"
    fi
    
    # Show listening ports
    print_status "Listening ports:"
    netstat -tlnp | grep apache2 || echo "  No Apache2 processes found"
    
    # Show domain info
    print_status "Domain configuration:"
    echo "  Domain: $DOMAIN"
    echo "  Application URL: https://$DOMAIN/pajakapp"
    echo "  Health Check: https://$DOMAIN/pajakapp/health"
}

# Function to show logs
show_logs() {
    local log_type=${1:-error}
    
    case $log_type in
        "error")
            print_header "Apache2 Error Logs"
            tail -f /var/log/apache2/pajak_error.log
            ;;
        "access")
            print_header "Apache2 Access Logs"
            tail -f /var/log/apache2/pajak_access.log
            ;;
        "all")
            print_header "Apache2 All Logs"
            tail -f /var/log/apache2/pajak_*.log
            ;;
        *)
            print_error "Unknown log type: $log_type"
            echo "Available types: error, access, all"
            ;;
    esac
}

# Function to setup SSL
setup_ssl() {
    print_header "Setting up SSL for Apache2"
    echo "=================================="
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        print_status "Installing certbot..."
        apt update
        apt install -y certbot python3-certbot-apache
    fi
    
    print_status "Setting up SSL certificate for $DOMAIN..."
    
    # Generate SSL certificate
    print_status "Generating SSL certificate..."
    certbot --apache -d "$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN"
    
    # Test configuration
    if apache2ctl configtest; then
        systemctl reload apache2
        print_status "SSL setup completed successfully!"
        print_status "Your application is now accessible at: https://$DOMAIN/pajakapp"
    else
        print_error "SSL setup failed. Please check the configuration."
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [install|configure|enable|disable|status|logs|ssl]"
    echo ""
    echo "Commands:"
    echo "  install   - Install Apache2 and required modules"
    echo "  configure - Install Apache2 configuration file"
    echo "  enable    - Enable the Pajak Next.js site"
    echo "  disable   - Disable the Pajak Next.js site"
    echo "  status    - Check Apache2 status and configuration"
    echo "  logs      - Show Apache2 logs (error|access|all)"
    echo "  ssl       - Setup SSL certificate with Let's Encrypt"
    echo "  help      - Show this help message"
    echo ""
    echo "Domain: $DOMAIN/pajakapp"
}

# Main script
main() {
    local command=${1:-help}
    
    case $command in
        "install")
            check_root
            install_apache2
            ;;
        "configure")
            check_root
            configure_apache2
            ;;
        "enable")
            check_root
            enable_site
            ;;
        "disable")
            check_root
            disable_site
            ;;
        "status")
            check_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "ssl")
            check_root
            setup_ssl
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 