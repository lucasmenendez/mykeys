package passwords

import "encoding/json"

// Password is the struct that represents a password, it has an username and a
// password.
type Password struct {
	Alias    string `json:"alias"`
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
type Passwords []*Password

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
func (p Passwords) Import(data []byte) (Passwords, error) {
	items := []Password{}
	if err := json.Unmarshal(data, &items); err != nil {
		return nil, err
	}
	for _, item := range items {
		p = append(p, &item)
	}
	return p, nil

}

// Get returns the password with the given alias.
func (p *Passwords) Get(alias string) *Password {
	for _, password := range *p {
		if password.Alias == alias {
			return password
		}
	}
	return nil
}

// Set sets the password with the given alias, username and password. If it
// already exists, it will be overwritten.
func (p Passwords) Set(alias, username, password string) Passwords {
	for i, pass := range p {
		if pass.Alias == alias {
			p[i].Username = username
			p[i].Password = password
			return p
		}
	}
	return append(p, &Password{Alias: alias, Username: username, Password: password})
}

// Del deletes the password with the given alias, if it exists.
func (p Passwords) Del(alias string) Passwords {
	for i, pass := range p {
		if pass.Alias == alias {
			p[i] = p[len(p)-1]
			return p[:len(p)-1]
		}
	}
	return p
}
