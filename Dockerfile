FROM node:20

# Install python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

COPY . .

RUN pip3 install --no-cache-dir -r requirements.txt
RUN npm install -g concurrently
RUN npm install

CMD ["concurrently", "--kill-others", "node server.js", "python3 app.py"]