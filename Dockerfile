FROM nginx:alpine

WORKDIR /app

COPY ./web /app
COPY ./build/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080