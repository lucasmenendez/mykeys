package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/lucasmenendez/mykeys/api"
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
	filepath   = flag.String("f", "secret.keys", "path to passwords file")
	passphrase = flag.String("p", "", "(required) passphrase to decrypt and encrypt the passwords file")
	action     = flag.String("a", "", "(required) action to perform: set, del, get, list")
	// input data flags
	alias    = flag.String("alias", "", "alias of the password")
	username = flag.String("user", "", "username of the password")
	password = flag.String("pass", "", "password of the password")
)

func openfile(path string) (string, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return "", fmt.Errorf("error during passwords reading: %w", err)
	}
	return string(content), nil
}

func savefile(path, content string) error {
	f, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("error during passwords saving: %w", err)
	}
	defer f.Close()

	if _, err := f.WriteString(content); err != nil {
		return fmt.Errorf("error during passwords saving: %w", err)
	}
	return nil
}

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
	mykeysAPI, err := api.New(*passphrase)
	if err != nil {
		fmt.Println(err)
		return
	}
	passwords, err := openfile(*filepath)
	if err != nil {
		fmt.Println(err)
		return
	}
	if passwords != "" {
		if err := mykeysAPI.Import(passwords); err != nil {
			fmt.Println(err)
			return
		}
	}
	// create a commit function to save or print the result
	commit := func() {
		// if print is true, print the result
		dump, err := mykeysAPI.Export()
		if err != nil {
			fmt.Println(err)
			return
		}
		// if print is false, save the result in the file and exit
		if err := savefile(*filepath, dump); err != nil {
			fmt.Println(err)
		}
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
		mykeysAPI.Set(*alias, *username, *password)
		commit()
	case "del":
		// check required flags for delete action (alias)
		if alias == nil || *alias == "" {
			fmt.Println(aliasRequiredMsg)
			return
		}
		// perform the delete action with the provided flags and commit the
		// result
		mykeysAPI.Del(*alias)
		commit()
	case "get":
		// check required flags for get action (alias)
		if alias == nil || *alias == "" {
			fmt.Println(aliasRequiredMsg)
			return
		}
		// perform the get action with the provided flags, json flag defines
		// if the output should be printed in json format
		if pass := mykeysAPI.Get(*alias, false); pass != "" {
			fmt.Println(pass)
			return
		}
		fmt.Printf("password with alias %s not found\n", *alias)
	case "list":
		// perform the list action with the provided flags, json flag defines
		// if the output should be printed in json format
		if passes := mykeysAPI.List(false); passes != "" {
			fmt.Println(passes)
			return
		}
		fmt.Println("no passwords found")
	default:
		// by default print the no action message
		fmt.Println(noActionMsg)
	}
}
