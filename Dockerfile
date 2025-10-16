FROM node:20

# Installing Python, pip, and Supervisor
RUN apt-get update && \
    apt-get install -y python3 python3-pip supervisor && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY requirements.txt ./

# Install dependencies
RUN npm install
RUN pip install -r requirements.txt

# Copy the rest of the application
COPY . .

# Copy Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose both ports
EXPOSE 3022 5000

# Run Supervisor to start both processes
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
