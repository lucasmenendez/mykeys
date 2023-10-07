# MyKeys-CLI

``` 
$ > ./mykeys-cli -h                   
🔐 MyKeys CLI 🔐
Usage: mykeys-cli -p <passphrase> -a <action> [options]
Options:
  -a string
        action to perform: set, delelete, get, list
  -alias string
        alias of the password
  -b64 string
        passwords file content encoded in base64
  -f string
        path to passwords file (default "mykeys.out")
  -json
        print the output in json format
  -p string
        passphrase to decrypt and encrypt the passwords file
  -pass string
        password of the password
  -print
        print the password instead of writing to the filepath
  -user string
        username of the password

```