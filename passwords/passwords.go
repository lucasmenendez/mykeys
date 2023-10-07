package passwords

import "encoding/json"

// Password is the struct that represents a password, it has an username and a
// password.
type Password struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// String returns the string representation of the password. It uses the
// Export() method to get the json representation of the password and then
// converts it to string.
func (p *Password) String() string {
	if dump, err := p.Export(); err == nil {
		return string(dump)
	}
	return ""
}

// Export returns the json representation of the password.
func (p *Password) Export() ([]byte, error) {
	return json.Marshal(p)
}

// Passwords is the struct that represents a collection of passwords, it is a
// map of alias to password.
type Passwords map[string]*Password

// String returns the string representation of the passwords. It uses the
// Export() method to get the json representation of the passwords and then
// converts it to string.
func (p Passwords) String() string {
	if dump, err := p.Export(); err == nil {
		return string(dump)
	}
	return ""
}

// Export returns the json representation of the passwords.
func (p Passwords) Export() ([]byte, error) {
	return json.Marshal(p)
}

// Import imports the passwords from the json representation.
func (p Passwords) Import(data []byte) error {
	return json.Unmarshal(data, &p)
}

// Get returns the password with the given alias.
func (p Passwords) Get(alias string) *Password {
	return p[alias]
}

// Set sets the password with the given alias, username and password. If it
// already exists, it will be overwritten.
func (p Passwords) Set(alias, username, password string) Passwords {
	p[alias] = &Password{Username: username, Password: password}
	return p
}

// Del deletes the password with the given alias, if it exists.
func (p Passwords) Del(alias string) Passwords {
	delete(p, alias)
	return p
}
