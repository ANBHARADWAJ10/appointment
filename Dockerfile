FROM node:20

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt
RUN npm install -g concurrently
RUN npm install

CMD ["concurrently", "--kill-others", "node server.js", "python app.py"]