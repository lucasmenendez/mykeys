//go:build js && wasm
// +build js,wasm

package main

import (
	"fmt"
	"syscall/js"

	"github.com/lucasmenendez/mykeys-cli/api"
)

const (
	// js names
	jsClassName  = "MyKeysCLI"
	jsListMethod = "list"
	jsGetMethod  = "get"
	jsSetMethod  = "set"
	jsDelMethod  = "del"
	// required number of arguments for each method
	listPasswordsNArgs = 2 // b64, passphrase
	getPasswordNArgs   = 3 // b64, passphrase, alias
	setPasswordNArgs   = 5 // b64, passphrase, alias, username, password
	delPasswordNArgs   = 3 // b64, passphrase, alias
)

func initCLI(b64, passphrase js.Value) (*api.API, error) {
	// Check required param (passphrase)
	if passphrase.String() == "" {
		return nil, fmt.Errorf("no passphrase provided")
	}
	// Create CLI with empty filepath and the provided passphrase
	mykeysAPI := api.New(passphrase.String())
	// Import from base64 or read it from the file
	if b64.String() != "" {
		if err := mykeysAPI.Import(b64.String()); err != nil {
			return nil, err
		}
	}
	return mykeysAPI, nil
}

func main() {
	myKeysClass := js.ValueOf(map[string]interface{}{})
	myKeysClass.Set(jsListMethod,
		js.FuncOf(func(this js.Value, args []js.Value) any {
			// Check the number of required params (b64 and passphrase)
			if len(args) != listPasswordsNArgs {
				return fmt.Sprintf("error: %d arguments required", listPasswordsNArgs)
			}
			// Create CLI
			mykeysAPI, err := initCLI(args[0], args[1])
			if err != nil {
				return fmt.Sprintf("error: %s", err.Error())
			}
			// Return the list of passwords as a JSON string
			return mykeysAPI.List(true)
		}))
	myKeysClass.Set(jsGetMethod,
		js.FuncOf(func(this js.Value, args []js.Value) any {
			// Check the number of required params (b64, passphrase and alias)
			if len(args) != getPasswordNArgs {
				return fmt.Sprintf("error: %d arguments required", getPasswordNArgs)
			}
			// Create CLI
			mykeysAPI, err := initCLI(args[0], args[1])
			if err != nil {
				return fmt.Sprintf("error: %s", err.Error())
			}
			// Return the password as a JSON string
			return mykeysAPI.Get(args[2].String(), true)
		}))
	myKeysClass.Set(jsSetMethod,
		js.FuncOf(func(this js.Value, args []js.Value) any {
			// Check the number of required params (b64, passphrase, alias,
			// username and password)
			if len(args) != setPasswordNArgs {
				return fmt.Sprintf("error: %d arguments required", setPasswordNArgs)
			}
			// Create CLI
			mykeysAPI, err := initCLI(args[0], args[1])
			if err != nil {
				return fmt.Sprintf("error: %s", err.Error())
			}
			// Set the password
			mykeysAPI.Set(args[2].String(), args[3].String(), args[4].String())
			// Return the list of passwords as a JSON string
			list, err := mykeysAPI.Export()
			if err != nil {
				return fmt.Sprintf("error: %s", err.Error())
			}
			return list
		}))
	myKeysClass.Set(jsDelMethod,
		js.FuncOf(func(this js.Value, args []js.Value) any {
			// Check the number of required params (b64, passphrase and alias)
			if len(args) != delPasswordNArgs {
				return fmt.Sprintf("error: %d arguments required", delPasswordNArgs)
			}
			// Create CLI
			mykeysAPI, err := initCLI(args[0], args[1])
			if err != nil {
				return fmt.Sprintf("error: %s", err.Error())
			}
			// Delete the password
			mykeysAPI.Del(args[2].String())
			// Return the list of passwords as a JSON string
			list, err := mykeysAPI.Export()
			if err != nil {
				return fmt.Sprintf("error: %s", err.Error())
			}
			return list
		}))
	// Set the MyKeys class in the global scope of the JS environment
	js.Global().Set(jsClassName, myKeysClass)
	// keep the program running forever
	select {}
}
