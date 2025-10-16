FROM node:18-slim

# Install Python and required system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Node.js application files
COPY package*.json ./
RUN npm install

# Copy Python Flask application files
COPY requirements.txt ./

# Install Python packages with --break-system-packages flag for Docker
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt

# Copy all application files
COPY . .

# Create supervisor configuration
RUN mkdir -p /var/log/supervisor
COPY <<EOF /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:nodejs]
command=node server.js
directory=/app
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/nodejs.log
stderr_logfile=/var/log/supervisor/nodejs_err.log

[program:flask]
command=python3 app.py
directory=/app
autostart=true
autorestart=true
stdout_logfile=/var/log/supervisor/flask.log
stderr_logfile=/var/log/supervisor/flask_err.log
EOF

# Expose ports (adjust as needed)
EXPOSE 3000 5000

# Start supervisor to manage both applications
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]