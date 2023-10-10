package api

import (
	"fmt"

	"github.com/lucasmenendez/mykeys-cli/base64url"
	"github.com/lucasmenendez/mykeys-cli/cipher"
	"github.com/lucasmenendez/mykeys-cli/passwords"
)

// API is the struct that represents the command line interface of MyKeys. Ir
// has the filepath of the passwords file, the passphrase to encrypt and
// decrypt it and a password map.
type API struct {
	passphrase []byte
	passwords  passwords.Passwords
}

// New returns an empty API with the given  passphrase. It also inits
// the passwords map. It converts the passphrase from string to a slice of
// bytes.
func New(passphrase string) *API {
	return &API{
		passphrase: []byte(passphrase),
		passwords:  make(map[string]*passwords.Password),
	}
}

// Import imports the passwords from the base64url encoded string and passphrase
// provided. It returns an error if the base64url decoding, the passwords
// decryption or the passwords import fails.
func (api *API) Import(dump string) error {
	// decode the base64 string
	encrypted, err := base64url.DecodeString(dump)
	if err != nil {
		return fmt.Errorf("error during passwords decoding: %w", err)
	}
	// decrypt the passwords file with the passphrase provided
	rawPasswords, err := cipher.Decrypt(encrypted, api.passphrase)
	if err != nil {
		return fmt.Errorf("error during passwords decryption: %w", err)
	}
	// import the passwords into the passwords map
	if err := api.passwords.Import(rawPasswords); err != nil {
		return fmt.Errorf("error during passwords import: %w", err)
	}
	return nil
}

// Export encrypts with the CLI passphrase, and exports the passwords map to a
// base64url encoded string. It returns an error if the passwords encryption or
// the base64 encoding fails.
func (api *API) Export() (string, error) {
	// export the passwords map to a json representation
	rawPasswords, err := api.passwords.Export()
	if err != nil {
		return "", fmt.Errorf("error during passwords export: %w", err)
	}
	// encrypt the json representation with the passphrase provided
	encrypted, err := cipher.Encrypt(rawPasswords, api.passphrase)
	if err != nil {
		return "", fmt.Errorf("error during passwords encryption: %w", err)
	}
	// encode the encrypted data to base64
	return base64url.EncodeToString(encrypted), nil
}

// Set sets the password with the given alias, username and password. If it
// already exists, it will be overwritten.
func (api *API) Set(alias, username, password string) {
	api.passwords = api.passwords.Set(alias, username, password)
}

// Del deletes the password with the given alias, if it exists.
func (api *API) Del(alias string) {
	api.passwords = api.passwords.Del(alias)
}

// List lists all the passwords in the passwords map. If json is true, it will
// print the json representation of the passwords map. If json is false, it
// will print the string representation of the passwords map.
func (api *API) List(json bool) string {
	if json {
		return api.passwords.String()
	}
	var result string
	for alias, pass := range api.passwords {
		result += fmt.Sprintf("[%s] %s: %s\n", alias, pass.Username, pass.Password)
	}
	return result
}

// Get returns the password with the given alias. If json is true, it will
// print the json representation of the password. If json is false, it will
// print the string representation of the password.
func (api *API) Get(alias string, json bool) string {
	if pass := api.passwords.Get(alias); pass != nil {
		if json {
			return pass.String()
		}
		return fmt.Sprintf("[%s] %s: %s\n", alias, pass.Username, pass.Password)
	}
	return ""
}