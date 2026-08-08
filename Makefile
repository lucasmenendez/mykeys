.PHONY: cli web serve docker all

VERSION := $(shell git describe --tags --always --dirty 2>/dev/null || date +%s)

cli:
	+rm -rf ./bin/mykeys-cli
	go build -o ./bin/mykeys-cli ./cmd/cli/main.go
	chmod +x ./bin/mykeys-cli

web:
	+rm -rf ./web/mykeys.wasm
	GOOS=js GOARCH=wasm go build -o ./web/public/mykeys.wasm ./cmd/webassembly/main.go
	@cp "$$(go env GOROOT)/lib/wasm/wasm_exec.js" ./web/public 2>/dev/null || cp "$$(go env GOROOT)/misc/wasm/wasm_exec.js" ./web/public/
	@echo "web built (version $(VERSION))"

serve: web
	cd web && npm run build && python3 -m http.server -d .output/public 5500

docker:
	docker build -t mykeys .
	docker run -d --rm -p 8080:80 mykeys

all: cli web
