.PHONY: cli web serve docker all extension extension-zip crx

VERSION := $(shell git describe --tags --always --dirty 2>/dev/null || date +%s)

# Signing key and Chrome binary used by `make crx`. Override them on the command
# line, e.g. `make crx CHROME_KEY=/path/to/extension.pem`.
CHROME_KEY ?= extension.pem
CHROME ?= $(shell \
	command -v google-chrome 2>/dev/null || \
	command -v chromium 2>/dev/null || \
	command -v chromium-browser 2>/dev/null || \
	{ [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ] && echo "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; } || \
	{ [ -x "/Applications/Chromium.app/Contents/MacOS/Chromium" ] && echo "/Applications/Chromium.app/Contents/MacOS/Chromium"; } || \
	echo "")

cli:
	+rm -rf ./bin/mykeys-cli
	go build -o ./bin/mykeys-cli ./cmd/cli/main.go
	chmod +x ./bin/mykeys-cli

web:
	+rm -rf ./web/public/mykeys.wasm
	GOOS=js GOARCH=wasm go build -o ./web/public/mykeys.wasm ./cmd/webassembly/main.go
	@cp -f "$$(go env GOROOT)/lib/wasm/wasm_exec.js" ./web/public/ 2>/dev/null || cp -f "$$(go env GOROOT)/misc/wasm/wasm_exec.js" ./web/public/
	@chmod u+w ./web/public/wasm_exec.js
	@npm --prefix ./web run build
	@echo "web built (version $(VERSION))"

# The extension ships the very same UI as the web app: its static build is
# assembled together with the extension-only files (manifest, popup, icons).
extension: web
	+rm -rf ./dist/extension
	@mkdir -p ./dist/extension
	@cp -R ./web/.output/public/. ./dist/extension/
	@mv ./dist/extension/_build ./dist/extension/static
	@sed 's|/_build/|/static/|g' ./dist/extension/index.html > ./dist/extension/.index.tmp
	@mv ./dist/extension/.index.tmp ./dist/extension/index.html
	@cp -f ./web/public/mykeys.wasm ./web/public/wasm_exec.js ./dist/extension/
	@chmod u+w ./dist/extension/wasm_exec.js
	@cp ./extension/manifest.json ./extension/background.js ./extension/open.html ./extension/open.js ./dist/extension/
	@cp -R ./extension/icons ./dist/extension/
	@rm -rf ./dist/extension/.vite
	@if find ./dist/extension -name '_*' | grep -q .; then \
		echo "error: Chrome rejects files/directories starting with '_'" >&2; exit 1; \
	fi
	@echo "extension built → ./dist/extension (version $(VERSION))"

extension-zip: extension
	+rm -f ./extension.zip
	@cd ./dist/extension && zip -qr ../../extension.zip . -x "*.DS_Store"
	@echo "extension packaged → ./extension.zip"

# Signed CRX for local testing and managed deployments. The key defines the
# extension ID, so reuse the same one across builds (`CHROME_KEY=...`).
crx: extension
	@if [ -z "$(CHROME)" ]; then \
		echo "error: Chrome/Chromium not found; run 'make crx CHROME=/path/to/chrome'" >&2; exit 1; \
	fi
	@if [ ! -f "$(CHROME_KEY)" ]; then \
		echo "error: signing key '$(CHROME_KEY)' not found." >&2; \
		echo "       create one with:" >&2; \
		echo "       openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out $(CHROME_KEY)" >&2; \
		exit 1; \
	fi
	@TMPKEY=$$(mktemp); \
	if ! openssl pkcs8 -topk8 -nocrypt -in "$(CHROME_KEY)" -out "$$TMPKEY" 2>/dev/null; then \
		cp "$(CHROME_KEY)" "$$TMPKEY"; \
	fi; \
	"$(CHROME)" --no-message-box \
		--pack-extension="$(CURDIR)/dist/extension" \
		--pack-extension-key="$$TMPKEY"; \
	STATUS=$$?; \
	rm -f "$$TMPKEY"; \
	[ $$STATUS -eq 0 ] || { echo "error: Chrome could not pack the extension (is it running?)" >&2; exit 1; }
	+rm -f ./extension.crx
	@mv ./dist/extension.crx ./extension.crx
	@head -c 4 ./extension.crx | grep -q 'Cr24' || { echo "error: invalid CRX" >&2; exit 1; }
	@printf 'crx built → ./extension.crx (extension id: '; \
	openssl rsa -in "$(CHROME_KEY)" -pubout -outform DER 2>/dev/null | \
	node -e 'const c=require("crypto"),ch=[];process.stdin.on("data",d=>ch.push(d)).on("end",()=>{const h=c.createHash("sha256").update(Buffer.concat(ch)).digest("hex").slice(0,32);console.log([...h].map(x=>String.fromCharCode(97+parseInt(x,16))).join(""))})' | tr -d '\n'; \
	echo ')'

serve: web
	python3 -m http.server -d ./web/.output/public 5500

docker:
	docker build -t mykeys .
	docker run -d --rm -p 8080:80 mykeys

all: cli web
