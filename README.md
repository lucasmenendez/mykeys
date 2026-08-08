[![Last release](https://img.shields.io/github/v/release/lucasmenendez/mykeys?color=purple)](https://github.com/lucasmenendez/mykeys/releases/latest)
[![GoDoc](https://godoc.org/github.com/lucasmenendez/mykeys?status.svg)](https://godoc.org/github.com/lucasmenendez/mykeys) 
[![Go Report Card](https://goreportcard.com/badge/github.com/lucasmenendez/mykeys)](https://goreportcard.com/report/github.com/lucasmenendez/mykeys)
[![Lint and test](https://github.com/lucasmenendez/mykeys/actions/workflows/test.yml/badge.svg)](https://github.com/lucasmenendez/mykeys/actions/workflows/test.yml)
[![license](https://img.shields.io/github/license/lucasmenendez/mykeys)](LICENSE)

# 🔐 MyKeys.live

MyKeys is a simple web app to **manage collections of passwords as bookmarks**. It transforms your **encrypted passwords into a long url** that you can add to bookmarks to open it later and share with your friends. It also supports downloading or copying the passwords as a file and opening or pasting them later.

The web app is a single-page app built with SolidJS. A Go core compiled to WebAssembly runs entirely in your browser — encrypting and decrypting your vault on your device. Your passwords never leave your browser; there is no server storing anything.

## Features
The [mykeys.live](https://mykeys.live/) webapp allows to manage your passwords in a secure way, using two levels of security:
 * **Something that you know** 💆: the passphrase used to encrypt your passwords.
 * **Something that you have** 💁: the bookmark with your encrypted passwords or the file with them.

The passwords stored will include:
 - 🆔 **Alias**: Human tag to identify the credential. It is used to filter your passwords in very long collections. *Ex.: 'Spotify for Artist'*.
 - 👤 **Username**: The account identifier of the credential into its service. *Ex.: 'cruz.cafune@mecen-ent.com'*.
 - 🔑 **Password**: The account password of the credential. *Ex.: 'M4r4cuch0'*.

#### Secured with a master passphrase
To open or save your passwords, you must provide a passphrase used as a **master password** to encrypt them. The passphrase has the following requirements:
 - At least eight characters.
 - At least one lowercase letter.
 - At least one UPPERCASE letter.
 - At least one number.

#### Encrypted format
MyKeys stores your passwords encrypted and base64url-encoded:
 - **AES-256-GCM** — a modern authenticated cipher: it both encrypts and detects tampering.
 - The key is derived from your passphrase, and every encryption uses a fresh random nonce, so the same data never encrypts to the same bytes twice.
 - The result is encoded as URL-safe base64 (`base64url`), ready to be carried as a bookmark or a file.

Since the key is derived directly from the passphrase, a long, random passphrase is what keeps the vault safe.

#### Credentials data as URL
When you save your passwords as a bookmark, the encrypted payload is placed in the URL query parameter (`?data=`). With this solution you can access your passwords in any browser that has your bookmarks synced, or share the link.

## Interfaces

MyKeys has two interoperable interfaces: the web app and the CLI. Passwords created with one can be opened by the other.

This is possible because both interfaces use the same Go core. The web app compiles that core to WebAssembly.

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
The web app opens passwords from a URL, pasted text, a bookmark, or a file. It does not store information locally or on a server. Everything runs in the browser — the passphrase decrypts the vault locally and nothing is uploaded.

#### Build it
```sh
# build the WebAssembly core (writes web/public/mykeys.wasm and wasm_exec.js)
make web

# build the web app (requires Node 24+; produces the static output in web/.output/public)
cd web && npm ci && npm run build
```

#### Demo time!
```sh
# build and serve the app on port 5500
make serve
```
Go to [localhost:5500](http://127.0.0.1:5500) to check a demo.

## Credits

Thanks to much to my CSS Grid teacher Sandra Laguna and to my professional beta testers [Pablo Duque](https://github.com/pabloduque0), [Mario Rodriguez](https://github.com/mapno), [Marcos Stival](https://github.com/mrksph), [Alberto Rojas](https://github.com/r0jasx) and [Manuel Méndez](https://www.linkedin.com/in/manuel-m%C3%A9ndez-garc%C3%ADa-0ba16316a/).
