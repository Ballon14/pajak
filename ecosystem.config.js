module.exports = {
    apps: [
        {
            name: "pajakapp",
            script: "npm",
            args: "start",
            cwd: "/var/www/pajakapp",
            instances: "max",
            exec_mode: "cluster",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3000,
            },
            error_file: "/var/log/pm2/pajakapp-error.log",
            out_file: "/var/log/pm2/pajakapp-out.log",
            log_file: "/var/log/pm2/pajakapp-combined.log",
            time: true,
            max_memory_restart: "1G",
            restart_delay: 4000,
            max_restarts: 10,
        },
    ],
}
