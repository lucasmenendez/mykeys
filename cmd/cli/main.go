package main

import (
	"flag"
	"fmt"

	"github.com/lucasmenendez/mykeys-cli/cli"
)

const (
	// cli messages
	passphraseRequired  = "passphrase is required, please use -p flag"
	noActionMsg         = "action is required, please use -a flag"
	aliasRequiredMsg    = "alias is required, please use -alias flag"
	usernameRequiredMsg = "username is required, please use -user flag"
	passwordRequiredMsg = "password is required, please use -pass flag"
	usageMsg            = `🔐 MyKeys CLI 🔐
Usage: mykeys-cli -p <passphrase> -a <action> [options]
Options:`
)

var (
	// config flags
	filepath   = flag.String("f", "mykeys.out", "path to passwords file")
	b64        = flag.String("b64", "", "passwords file content encoded in base64")
	passphrase = flag.String("p", "", "(required) passphrase to decrypt and encrypt the passwords file")
	action     = flag.String("a", "", "(required) action to perform: set, delelete, get, list")
	print      = flag.Bool("print", false, "print the password instead of writing to the filepath")
	json       = flag.Bool("json", false, "print the output in json format")
	// input data flags
	alias    = flag.String("alias", "", "alias of the password")
	username = flag.String("user", "", "username of the password")
	password = flag.String("pass", "", "password of the password")
)

func main() {
	flag.Usage = func() {
		fmt.Println(usageMsg)
		flag.PrintDefaults()
	}
	flag.Parse()
	// Check required flags
	if passphrase == nil || *passphrase == "" {
		fmt.Println(passphraseRequired)
		return
	}
	if action == nil || *action == "" {
		fmt.Println(noActionMsg)
		return
	}
	// Create CLI
	mykeysCLI := cli.New(*filepath, *passphrase)
	// Import from base64 or read it from the file
	if b64 != nil && *b64 != "" {
		if err := mykeysCLI.Import(*b64); err != nil {
			fmt.Println(err)
			return
		}
	} else {
		if err := mykeysCLI.Open(); err != nil {
			fmt.Println(err)
			return
		}
	}
	// create a commit function to save or print the result
	commit := func() {
		// if print is false, save the result in the file and exit
		if print == nil || !*print {
			if err := mykeysCLI.Save(); err != nil {
				fmt.Println(err)
			}
			return
		}
		// if print is true, print the result
		dump, err := mykeysCLI.Export()
		if err != nil {
			fmt.Println(err)
			return
		}
		fmt.Println(dump)
	}
	// check the provided action
	switch *action {
	case "set":
		// check required flags for set action (alias, username, password)
		if alias == nil || *alias == "" {
			fmt.Println(aliasRequiredMsg)
			return
		}
		if username == nil || *username == "" {
			fmt.Println(usernameRequiredMsg)
			return
		}
		if password == nil || *password == "" {
			fmt.Println(passwordRequiredMsg)
			return
		}
		// perform the set action with the provided flags and commit the result
		mykeysCLI.Set(*alias, *username, *password)
		commit()
	case "delete":
		// check required flags for delete action (alias)
		if alias == nil || *alias == "" {
			fmt.Println(aliasRequiredMsg)
			return
		}
		// perform the delete action with the provided flags and commit the
		// result
		mykeysCLI.Del(*alias)
		commit()
	case "get":
		// check required flags for get action (alias)
		if alias == nil || *alias == "" {
			fmt.Println(aliasRequiredMsg)
			return
		}
		// perform the get action with the provided flags, json flag defines
		// if the output should be printed in json format
		mykeysCLI.Get(*alias, *json)
	case "list":
		// perform the list action with the provided flags, json flag defines
		// if the output should be printed in json format
		mykeysCLI.List(*json)
	default:
		// by default print the no action message
		fmt.Println(noActionMsg)
	}
}
