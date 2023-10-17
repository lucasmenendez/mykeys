package passwords

import (
	"encoding/json"
	"fmt"
	"hash/fnv"
	"log"
	"strings"
)

// Password is the struct that represents a password, it has an username and a
// password.
type Password struct {
	ID       string `json:"id"`
	Alias    string `json:"alias"`
	Username string `json:"username"`
	Password string `json:"password"`
}

// calculateID calculates the ID of the password using the alias and the
// username. It uses the FNV-1a hash algorithm to calculate the ID and returns
// the hexadecimal representation of the hash.
func calculateID(seeds ...string) string {
	hashFn := fnv.New128()
	seed := strings.Join(seeds, "-")
	hashFn.Write([]byte(seed))
	return fmt.Sprintf("%x", hashFn.Sum(nil))
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

// List returns a list with a copy of the current Password's.
func (p *Passwords) List() []*Password {
	return append([]*Password{}, p.passwords...)
}

// Export returns the json representation of the password.
func (p *Password) Export() ([]byte, error) {
	return json.Marshal(p)
}

// Passwords is the struct that represents a collection of passwords, it is a
// map of alias to password.
type Passwords struct {
	passwords []*Password
}

// String returns the string representation of the passwords. It uses the
// Export() method to get the json representation of the passwords and then
// converts it to string.
func (p *Passwords) String() string {
	if dump, err := p.Export(); err == nil {
		log.Println(string(dump))
		return string(dump)
	}
	return ""
}

// Export returns the json representation of the passwords.
func (p *Passwords) Export() ([]byte, error) {
	return json.Marshal(p.passwords)
}

// Import imports the passwords from the json representation.
func (p *Passwords) Import(data []byte) error {
	items := []Password{}
	if err := json.Unmarshal(data, &items); err != nil {
		return err
	}
	for _, item := range items {
		p.passwords = append(p.passwords, &Password{
			ID:       item.ID,
			Alias:    item.Alias,
			Username: item.Username,
			Password: item.Password,
		})
	}
	return nil

}

// Get returns the password with the given alias.
func (p *Passwords) Get(alias string) *Password {
	for _, password := range p.passwords {
		if password.Alias == alias {
			return password
		}
	}
	return nil
}

// Set sets the password with the given alias, username and password. If it
// already exists, it will be overwritten.
func (p *Passwords) Set(alias, username, password string) {
	precomputedID := calculateID(alias, username)
	for i, pass := range p.passwords {
		if pass.ID == precomputedID {
			p.passwords[i].Alias = alias
			p.passwords[i].Username = username
			p.passwords[i].Password = password
			return
		}
	}
	p.passwords = append(p.passwords, &Password{
		ID:       precomputedID,
		Alias:    alias,
		Username: username,
		Password: password,
	})
}

// Del deletes the password with the given alias, if it exists.
func (p *Passwords) Del(id string) {
	for i, pass := range p.passwords {
		if pass.ID == id {
			copy(p.passwords[i:], p.passwords[i+1:])
			p.passwords = p.passwords[:len(p.passwords)-1]

			return
		}
	}
}
