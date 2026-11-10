FROM golang:alpine AS wasm

WORKDIR /app

COPY go.mod go.sum ./
COPY api ./api
COPY passwords ./passwords
COPY cipher ./cipher
COPY base64url ./base64url
COPY cmd ./cmd

RUN mkdir -p web/public \
 && GOOS=js GOARCH=wasm go build -o ./web/public/mykeys.wasm ./cmd/webassembly/main.go \
 && cp "$(go env GOROOT)/lib/wasm/wasm_exec.js" ./web/public/wasm_exec.js

FROM node:24-alpine AS web

WORKDIR /app/web

COPY web/package.json web/package-lock.json ./
RUN npm ci

COPY web/ ./
COPY --from=wasm /app/web/public/mykeys.wasm ./public/mykeys.wasm
COPY --from=wasm /app/web/public/wasm_exec.js ./public/wasm_exec.js

RUN npm run build

FROM nginx:alpine AS production

WORKDIR /webapp

COPY --from=web /app/web/.output/public /webapp
COPY ./build/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
