FROM node:20

# Installing Python 3.10, pip, build dependencies, and Supervisor
RUN apt-get update && \
    apt-get install -y software-properties-common && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && \
    apt-get install -y \
        python3.10 \
        python3.10-pip \
        python3.10-venv \
        python3.10-dev \
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
    ln -sf /usr/bin/python3.10 /usr/bin/python3 && \
    ln -sf /usr/bin/pip3.10 /usr/bin/pip3 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY requirements.txt ./

# Upgrade pip first
RUN pip3 install --upgrade pip

# Install Python dependencies with verbose output for debugging
RUN pip3 install --no-cache-dir --verbose -r requirements.txt

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
