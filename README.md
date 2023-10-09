# MyKeys-CLI

## CLI

### Build
```sh
go build -o ./mykeys-cli ./cmd/cli && chmod +x ./mykeys-cli
```

### Demo
``` 
$ > ./mykeys-cli -h                   
🔐 MyKeys CLI 🔐
Usage: mykeys-cli -p <passphrase> -a <action> [options]
Options:
  -a string
        (required) action to perform: set, del, get, list
  -alias string
        alias of the password
  -b64 string
        passwords file content encoded in base64
  -f string
        path to passwords file (default "mykeys.out")
  -json
        print the output in json format
  -p string
        (required) passphrase to decrypt and encrypt the passwords file
  -pass string
        password of the password
  -print
        print the password instead of writing to the filepath
  -user string
        username of the password
```

## WebAssembly

### Build
```sh
# build for webassembly and save the result in the ./web folder
GOOS=js GOARCH=wasm go build -o ./web/main.wasm ./cmd/webassembly
```

### Demo
```sh
# copy wasm_exec.js from yout go installation to ./web folder
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" ./web

# go to ./web folder and start an local http server on 5500 port
cd ./web && python3 -m http.server 5500
```
Go to [localhost:5500](http://127.0.0.1:5500) to check a demo.