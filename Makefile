.PHONY: cli web all

cli: 
	+rm -rf ./bin/mykeys-cli
	go build -o ./bin/mykeys-cli ./cmd/cli/main.go
	chmod +x ./bin/mykeys-cli

web:
	+rm -rf ./web/mykeys.wasm
	GOOS=js GOARCH=wasm go build -o ./web/mykeys.wasm ./cmd/webassembly/main.go
	@cp "$$(go env GOROOT)/misc/wasm/wasm_exec.js" ./web

docker:
	docker build -t mykeys .
	docker run -d --rm -p 8080:80 mykeys

all: cli web