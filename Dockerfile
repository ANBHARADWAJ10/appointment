FROM node:20

# Installing Python 3.11, pip, build dependencies, and Supervisor
RUN apt-get update && \
    apt-get install -y \
        python3 \
        python3-pip \
        python3-venv \
        python3-dev \
        build-essential \
        gcc \
        g++ \
        libfreetype6-dev \
        libjpeg-dev \
        libpng-dev \
        zlib1g-dev \
        libxml2-dev \
        libxslt1-dev \
        supervisor && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY requirements.txt ./

# Upgrade pip first and break system packages restriction
RUN pip3 install --upgrade pip --break-system-packages

# Install Python dependencies
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Copy Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose both ports
EXPOSE 3022 5000

# Run Supervisor to start both processes
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
