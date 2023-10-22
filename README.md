[![Last release](https://img.shields.io/github/v/release/lucasmenendez/mykeys?color=purple)](https://github.com/lucasmenendez/mykeys/releases/latest)
[![GoDoc](https://godoc.org/github.com/lucasmenendez/mykeys?status.svg)](https://godoc.org/github.com/lucasmenendez/mykeys) 
[![Go Report Card](https://goreportcard.com/badge/github.com/lucasmenendez/mykeys)](https://goreportcard.com/report/github.com/lucasmenendez/mykeys)
[![Lint and test](https://github.com/lucasmenendez/mykeys/actions/workflows/test.yml/badge.svg)](https://github.com/lucasmenendez/mykeys/actions/workflows/test.yml)
[![license](https://img.shields.io/github/license/lucasmenendez/mykeys)](LICENSE)

# 🔐 MyKeys.live

MyKeys is a simple web app to **manage collections of passwords as bookmarks**. It transforms your **encrypted passwords into a long url** that you can add to bookmarks to open it later and share with your friends. It also support to download or copy the passwords as a file and open or paste them later.

## Features
The [mykeys.live](https://mykeys.live/) webapp allows to manage your passwords in a secure way, using two levels of security:
 * **Something that you know** 💆: the passphrase used to encrypt your passwords.
 * **Something that you have** 💁: the bookmark with your encrypted passwords or the file with them.

The passwords stored will include:
 - 🆔 **Alias**: Human tag to identify the credential. It is used to filter your passwords in very long collections. *Ex.: 'Spotify for Artist'*.
 - 👤 **Username**: The account identifier of the credential into its service. *Ex.: 'cruz.cafune@mecen-ent.com'*.
 - 🔑 **Password**: The account password of the credential. *Ex.: 'M4r4cuch0'*.

#### Securized with a master password
To open or save your passwors, you must provide a passphrase used as a **master password** to encrypt them. The passphrase has the following requirements:
 - At least one letter.
 - At least one number.
 - At least eight characters.

#### Credentials data as URL
When you store your passwords as bookmark, the passwords are encrypted with your passphrease and encoded in base64 (url compatible version), and they are placed as a part of the url then. With this solution you can access to your passwords in any browser that has your bookmarks synced.

## Interfaces

Mykeys has both interfaces to interact with your passwords, and there are totally interoperable, which means that the passwords created with one of them are compatible with the other one.

This is possible because the web app uses the same basecode that the CLI, writted in Go and compiled with WebAssembly to be used on browsers.

### ⌨️ CLI
A simple console tool to manage your passwords files. It does not store any information or data, it is just a cli to manage your encrypted passwords.

#### Build it
```sh
go build -o ../../bin/mykeys-cli . && chmod +x ../../bin/mykeys-cli

# or:
# cd .. && make cli
```

#### Demo time!
``` 
$ > ./mykeys-cli -h                   
🔐 MyKeys CLI 🔐
Usage: mykeys-cli -p <passphrase> -a <action> [options]
Options:
  -a string
        (required) action to perform: set, del, get, list
  -alias string
        alias of the password
  -f string
        path to passwords file (default "mykeys.out")
  -p string
        (required) passphrase to decrypt and encrypt the passwords file
  -pass string
        password of the password
  -user string
        username of the password
```

### 📱 Web app
A Vue web app that allows to upload your passwords or open it from a URL. It does not store any information, it is just an interface to decrypt and manage your passwords from browsers.

#### Build it
```sh
# build for webassembly and save the result in the ./web folder
GOOS=js GOARCH=wasm go build -o ./web/main.wasm ./cmd/webassembly

# or:
# make web
```

#### Demo time!
```sh
# copy wasm_exec.js from yout go installation to ./web folder
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" ./web

# go to ./web folder and start an local http server on 5500 port
cd ./web && python3 -m http.server 5500
```
Go to [localhost:5500](http://127.0.0.1:5500) to check a demo.

## Credits

Thanks to much to my CSS Grid teacher Sandra Laguna and to my professional beta testers [Pablo Duque](https://github.com/pabloduque0), [Mario Rodriguez](https://github.com/mapno), [Marcos Stival](https://github.com/mrksph), [Alberto Rojas](https://github.com/r0jasx) and [Manuel Méndez](https://www.linkedin.com/in/manuel-m%C3%A9ndez-garc%C3%ADa-0ba16316a/).