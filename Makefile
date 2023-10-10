.PHONY: go web all

go: 
	go build -o ./bin/mykeys-cli ./cmd/cli/main.go
	chmod +x ./bin/mykeys-cli

web:
	GOOS=js GOARCH=wasm go build -o ./web/main.wasm ./cmd/webassembly/main.go

all: go web
