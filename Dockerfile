# Multi-stage build
FROM node:18 AS node-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM python:3.13.9
WORKDIR /app

# Install Node.js in Python container
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Copy Node.js app
COPY --from=node-stage /app/node_modules ./node_modules
COPY --from=node-stage /app/package*.json ./

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Start both services
CMD ["sh", "-c", "npm run dev & python app.py"]
