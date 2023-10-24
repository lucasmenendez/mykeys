FROM golang:alpine AS builder

WORKDIR /app

COPY . . 

RUN GOOS=js GOARCH=wasm go build -o ./web/mykeys.wasm ./cmd/webassembly/main.go
RUN sha256sum ./web/mykeys.wasm > ./web/sha256_checksums.txt
RUN cp /usr/local/go/misc/wasm/wasm_exec.js ./web/wasm_exec.js
RUN sha256sum ./web/wasm_exec.js >> ./web/sha256_checksums.txt

FROM nginx:alpine as production

WORKDIR /webapp

COPY --from=builder /app/web /webapp
COPY ./build/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80