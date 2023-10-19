.PHONY: cli web all

cli: 
	+rm -rf ./bin/mykeys-cli
	go build -o ./bin/mykeys-cli ./cmd/cli/main.go
	chmod +x ./bin/mykeys-cli

web:
	+rm -rf ./web/main.wasm
	GOOS=js GOARCH=wasm go build -o ./web/main.wasm ./cmd/webassembly/main.go

all: cli web