FROM node:18-bullseye

RUN apt-get update && apt-get install -y python3 python3-pip supervisor

WORKDIR /app

COPY . .

RUN pip3 install -r requirements.txt
RUN npm install


COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 3022 5000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]