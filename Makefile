
go: 
	go build -o ./bin/cli ./cmd/cli/main.go
	chmod +x ./bin/cli

web:
	GOOS=js GOARCH=wasm go build -o ./web/main.wasm ./cmd/webassembly/main.go

all: go web
