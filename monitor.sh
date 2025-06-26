#!/bin/bash

# Script Monitoring untuk Aplikasi Pajak Next.js
# Usage: ./monitor.sh [status|logs|resources|health]

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
APP_URL="https://iqbaldev.site/pajakapp"
HEALTH_ENDPOINT="$APP_URL/health"
CONTAINERS=("pajak-nextjs" "pajak-mongodb")

# Function to check container status
check_containers() {
    print_header "Container Status"
    echo "=================================="
    
    for container in "${CONTAINERS[@]}"; do
        if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q "$container"; then
            local status=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep "$container")
            print_status "$status"
        else
            print_error "Container $container is not running"
        fi
    done
    echo ""
}

# Function to check application health
check_health() {
    print_header "Application Health"
    echo "=================================="
    
    if command -v curl &> /dev/null; then
        local response=$(curl -s -w "%{http_code}" "$HEALTH_ENDPOINT" -o /tmp/health_response)
        
        if [ "$response" = "200" ]; then
            print_status "Application is healthy (HTTP $response)"
            if [ -f /tmp/health_response ]; then
                echo "Health data:"
                cat /tmp/health_response | jq '.' 2>/dev/null || cat /tmp/health_response
                rm -f /tmp/health_response
            fi
        else
            print_error "Application health check failed (HTTP $response)"
        fi
    else
        print_warning "curl not available, skipping health check"
    fi
    echo ""
}

# Function to check system resources
check_resources() {
    print_header "System Resources"
    echo "=================================="
    
    # CPU Usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    echo "CPU Usage: ${cpu_usage}%"
    
    # Memory Usage
    local mem_info=$(free -m | grep Mem)
    local mem_total=$(echo $mem_info | awk '{print $2}')
    local mem_used=$(echo $mem_info | awk '{print $3}')
    local mem_percent=$((mem_used * 100 / mem_total))
    echo "Memory Usage: ${mem_used}MB / ${mem_total}MB (${mem_percent}%)"
    
    # Disk Usage
    local disk_usage=$(df -h / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    echo "Disk Usage: ${disk_usage}%"
    
    # Docker Resources
    print_header "Docker Resources"
    echo "----------------------------------"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
    echo ""
}

# Function to check logs
check_logs() {
    local service=${1:-app}
    print_header "Recent Logs for $service"
    echo "=================================="
    
    case $service in
        "app"|"nextjs")
            docker-compose logs --tail=20 app
            ;;
        "db"|"mongodb")
            docker-compose logs --tail=20 mongodb
            ;;
        "all")
            for container in "${CONTAINERS[@]}"; do
                print_header "Logs for $container"
                echo "----------------------------------"
                docker logs --tail=10 "$container" 2>/dev/null || echo "Container not found or not running"
                echo ""
            done
            ;;
        *)
            print_error "Unknown service: $service"
            echo "Available services: app, db, all"
            ;;
    esac
}

# Function to check network connectivity
check_network() {
    print_header "Network Connectivity"
    echo "=================================="
    
    # Check if application is accessible
    if command -v curl &> /dev/null; then
        local response=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL")
        if [ "$response" = "200" ]; then
            print_status "Application is accessible (HTTP $response)"
        else
            print_error "Application is not accessible (HTTP $response)"
        fi
    fi
    
    # Check MongoDB connectivity
    if docker ps | grep -q "pajak-mongodb"; then
        local mongo_status=$(docker exec pajak-mongodb mongosh --eval "db.runCommand('ping')" --quiet 2>/dev/null | grep -c "ok" || echo "0")
        if [ "$mongo_status" -gt 0 ]; then
            print_status "MongoDB is accessible"
        else
            print_error "MongoDB is not accessible"
        fi
    fi
    echo ""
}

# Function to check security
check_security() {
    print_header "Security Check"
    echo "=================================="
    
    # Check for exposed ports
    local exposed_ports=$(docker ps --format "{{.Ports}}" | grep -o ":[0-9]*->" | wc -l)
    echo "Exposed ports: $exposed_ports"
    
    # Check for running containers as root
    local root_containers=$(docker ps --format "{{.Names}}\t{{.Image}}" | grep -c "root" || echo "0")
    if [ "$root_containers" -gt 0 ]; then
        print_warning "Some containers are running as root"
    else
        print_status "No containers running as root"
    fi
    
    # Check for latest security updates
    local update_count=$(apt list --upgradable 2>/dev/null | wc -l)
    if [ "$update_count" -gt 1 ]; then
        print_warning "$update_count packages can be updated"
    else
        print_status "System is up to date"
    fi
    echo ""
}

# Function to generate report
generate_report() {
    local report_file="monitoring_report_$(date +%Y%m%d_%H%M%S).txt"
    
    print_status "Generating monitoring report: $report_file"
    
    {
        echo "Monitoring Report - $(date)"
        echo "=================================="
        echo ""
        
        echo "Container Status:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        
        echo "System Resources:"
        echo "CPU: $(top -bn1 | grep 'Cpu(s)' | awk '{print $2}')"
        echo "Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
        echo "Disk: $(df -h / | tail -1 | awk '{print $5}')"
        echo ""
        
        echo "Docker Resources:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
        echo ""
        
        echo "Recent Application Logs:"
        docker-compose logs --tail=10 app
        echo ""
        
    } > "$report_file"
    
    print_status "Report saved to: $report_file"
}

# Function to setup monitoring alerts
setup_alerts() {
    print_header "Setting up Monitoring Alerts"
    echo "=================================="
    
    # Create monitoring script
    cat > monitor_alerts.sh << 'EOF'
#!/bin/bash

# Monitoring alerts script
APP_URL="https://iqbaldev.site/pajakapp"
HEALTH_ENDPOINT="$APP_URL/health"

# Check application health
response=$(curl -s -w "%{http_code}" "$HEALTH_ENDPOINT" -o /dev/null)
if [ "$response" != "200" ]; then
    echo "ALERT: Application health check failed (HTTP $response)" | mail -s "Application Alert" admin@iqbaldev.site
fi

# Check disk usage
disk_usage=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
if [ "$disk_usage" -gt 80 ]; then
    echo "ALERT: Disk usage is high: ${disk_usage}%" | mail -s "Disk Alert" admin@iqbaldev.site
fi

# Check memory usage
mem_percent=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ "$mem_percent" -gt 80 ]; then
    echo "ALERT: Memory usage is high: ${mem_percent}%" | mail -s "Memory Alert" admin@iqbaldev.site
fi
EOF
    
    chmod +x monitor_alerts.sh
    
    # Setup cron job (every 5 minutes)
    (crontab -l 2>/dev/null; echo "*/5 * * * * $(pwd)/monitor_alerts.sh") | crontab -
    
    print_status "Monitoring alerts setup completed"
    print_status "Alerts will be sent every 5 minutes if issues are detected"
}

# Main script
main() {
    local command=${1:-status}
    
    case $command in
        "status")
            check_containers
            check_health
            check_network
            ;;
        "logs")
            check_logs "$2"
            ;;
        "resources")
            check_resources
            ;;
        "health")
            check_health
            ;;
        "network")
            check_network
            ;;
        "security")
            check_security
            ;;
        "report")
            generate_report
            ;;
        "alerts")
            setup_alerts
            ;;
        "all")
            check_containers
            check_health
            check_resources
            check_network
            check_security
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [status|logs|resources|health|network|security|report|alerts|all]"
            echo ""
            echo "Commands:"
            echo "  status   - Check container and application status"
            echo "  logs     - Show recent logs (optional: service name)"
            echo "  resources- Check system and Docker resources"
            echo "  health   - Check application health"
            echo "  network  - Check network connectivity"
            echo "  security - Check security status"
            echo "  report   - Generate monitoring report"
            echo "  alerts   - Setup monitoring alerts"
            echo "  all      - Run all checks"
            echo "  help     - Show this help message"
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