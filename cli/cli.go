package cli

import (
	"encoding/base64"
	"fmt"
	"os"

	"github.com/lucasmenendez/mykeys-cli/cipher"
	"github.com/lucasmenendez/mykeys-cli/passwords"
)

// CLI is the struct that represents the command line interface of MyKeys. Ir
// has the filepath of the passwords file, the passphrase to encrypt and
// decrypt it and a password map.
type CLI struct {
	passphrase []byte
	filepath   string
	passwords  passwords.Passwords
}

// New returns a new CLI with the given filepath and passphrase. It also inits
// the passwords map. It converts the passphrase from string to a slice of
// bytes.
func New(filepath, passphrase string) *CLI {
	return &CLI{
		filepath:   filepath,
		passphrase: []byte(passphrase),
		passwords:  make(map[string]*passwords.Password),
	}
}

// Open opens the passwords file and decrypts it with the passphrase provided,
// filling the passwords map.
func (cli *CLI) Open() error {
	// read the encrypted passwords file
	encrypted, err := os.ReadFile(cli.filepath)
	if err != nil {
		return fmt.Errorf("error during passwords reading: %w", err)
	}
	// if the file is empty, return without error
	if len(encrypted) == 0 {
		return nil
	}
	// decrypt the passwords file with the passphrase provided
	rawPasswords, err := cipher.Decrypt(encrypted, cli.passphrase)
	if err != nil {
		return fmt.Errorf("error during passwords decryption: %w", err)
	}
	// import the passwords into the passwords map
	if err := cli.passwords.Import(rawPasswords); err != nil {
		return fmt.Errorf("error during passwords import: %w", err)
	}
	return nil
}

// Import imports the passwords from the base64 encoded string provided.
func (cli *CLI) Import(dump string) error {
	// decode the base64 string
	encrypted, err := base64.StdEncoding.DecodeString(dump)
	if err != nil {
		return fmt.Errorf("error during passwords decoding: %w", err)
	}
	// decrypt the passwords file with the passphrase provided
	rawPasswords, err := cipher.Decrypt(encrypted, cli.passphrase)
	if err != nil {
		return fmt.Errorf("error during passwords decryption: %w", err)
	}
	// import the passwords into the passwords map
	if err := cli.passwords.Import(rawPasswords); err != nil {
		return fmt.Errorf("error during passwords import: %w", err)
	}
	return nil
}

// Export encrypts and exports the passwords map to a base64 encoded string.
func (cli *CLI) Export() (string, error) {
	// export the passwords map to a json representation
	rawPasswords, err := cli.passwords.Export()
	if err != nil {
		return "", fmt.Errorf("error during passwords export: %w", err)
	}
	// encrypt the json representation with the passphrase provided
	encrypted, err := cipher.Encrypt(rawPasswords, cli.passphrase)
	if err != nil {
		return "", fmt.Errorf("error during passwords encryption: %w", err)
	}
	// encode the encrypted data to base64
	return base64.StdEncoding.EncodeToString(encrypted), nil
}

// Save encrypts and saves the passwords map to the passwords file, overwriting
// it.
func (cli *CLI) Save() error {
	// export the passwords map to a json representation
	rawPasswords, err := cli.passwords.Export()
	if err != nil {
		return fmt.Errorf("error during passwords export: %w", err)
	}
	// encrypt the json representation with the passphrase provided
	encrypted, err := cipher.Encrypt(rawPasswords, cli.passphrase)
	if err != nil {
		return fmt.Errorf("error during passwords encryption: %w", err)
	}
	// save the encrypted data to the passwords file, overwriting it
	if err := os.WriteFile(cli.filepath, encrypted, 0644); err != nil {
		return fmt.Errorf("error during passwords saving: %w", err)
	}
	return nil
}

// Set sets the password with the given alias, username and password. If it
// already exists, it will be overwritten.
func (cli *CLI) Set(alias, username, password string) {
	cli.passwords = cli.passwords.Set(alias, username, password)
}

// Del deletes the password with the given alias, if it exists.
func (cli *CLI) Del(alias string) {
	cli.passwords = cli.passwords.Del(alias)
}

// List lists all the passwords in the passwords map. If json is true, it will
// print the json representation of the passwords map. If json is false, it
// will print the string representation of the passwords map.
func (cli *CLI) List(json bool) {
	if json {
		fmt.Println(cli.passwords)
		return
	}
	for alias, pass := range cli.passwords {
		fmt.Printf("[%s] %s: %s\n", alias, pass.Username, pass.Password)
	}
}

// Get returns the password with the given alias. If json is true, it will
// print the json representation of the password. If json is false, it will
// print the string representation of the password.
func (cli *CLI) Get(alias string, json bool) {
	if pass := cli.passwords.Get(alias); pass != nil {
		if json {
			fmt.Println(pass)
			return
		}
		fmt.Printf("[%s] %s: %s\n", alias, pass.Username, pass.Password)
		return
	}
	fmt.Printf("%s not found\n", alias)
}
