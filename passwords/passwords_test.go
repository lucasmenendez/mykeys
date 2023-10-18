package passwords

import (
	"bytes"
	"fmt"
	"hash/fnv"
	"testing"
)

const (
	testAlias    = "alias"
	testUsername = "username"
	testPassword = "password"
)

var testID = calculateID(testAlias, testUsername)

func Test_calculateID(t *testing.T) {
	hashFn := fnv.New128()
	hashFn.Write([]byte(testAlias + "-" + testUsername))
	expectedID := fmt.Sprintf("%x", hashFn.Sum(nil))
	id := calculateID(testAlias, testUsername)
	if id != expectedID {
		t.Fatalf("Expected ID to be %s, got %s", expectedID, id)
	}

	hashFn.Reset()
	hashFn.Write([]byte(""))
	expectedID = fmt.Sprintf("%x", hashFn.Sum(nil))
	id = calculateID("")
	if id != expectedID {
		t.Fatalf("Expected ID to be %s, got %s", expectedID, id)
	}

	hashFn.Reset()
	hashFn.Write([]byte("-"))
	expectedID = fmt.Sprintf("%x", hashFn.Sum(nil))
	id = calculateID("", "")
	if id != expectedID {
		t.Fatalf("Expected ID to be %s, got %s", expectedID, id)
	}
}

func TestPassword_String(t *testing.T) {
	p := &Password{
		ID:       testID,
		Alias:    testAlias,
		Username: testUsername,
		Password: testPassword,
	}
	expectedString := `{"id":"` + testID + `","alias":"` + testAlias + `","username":"` + testUsername + `","password":"` + testPassword + `"}`
	if p.String() != expectedString {
		t.Fatalf("Expected string representation to be %s, got %s", expectedString, p.String())
	}
}

func TestPassword_Export(t *testing.T) {
	p := &Password{
		ID:       testID,
		Alias:    testAlias,
		Username: testUsername,
		Password: testPassword,
	}
	result, err := p.Export()
	if err != nil {
		t.Fatalf("Expected no error, got %s", err)
	}
	expectedString := `{"id":"` + testID + `","alias":"` + testAlias + `","username":"` + testUsername + `","password":"` + testPassword + `"}`
	if !bytes.Equal(result, []byte(expectedString)) {
		t.Fatalf("Expected string representation to be %s, got %s", expectedString, string(result))
	}
}

func TestPasswords_List(t *testing.T) {
	p := &Password{
		ID:       testID,
		Alias:    testAlias,
		Username: testUsername,
		Password: testPassword,
	}
	passwords := &Passwords{
		passwords: []*Password{p},
	}
	list := passwords.List()
	if len(list) != 1 {
		t.Fatalf("Expected list to have 1 element, got %d", len(list))
	}
	if list[0] != p {
		t.Fatalf("Expected list to have %v, got %v", p, list[0])
	}
}

func TestPasswords_String(t *testing.T) {
	p := &Password{
		ID:       testID,
		Alias:    testAlias,
		Username: testUsername,
		Password: testPassword,
	}
	passwords := &Passwords{
		passwords: []*Password{p},
	}
	expectedString := `[{"id":"` + testID + `","alias":"` + testAlias + `","username":"` + testUsername + `","password":"` + testPassword + `"}]`
	if passwords.String() != expectedString {
		t.Fatalf("Expected string representation to be %s, got %s", expectedString, passwords.String())
	}
}

func TestPasswords_Export(t *testing.T) {
	p := &Password{
		ID:       testID,
		Alias:    testAlias,
		Username: testUsername,
		Password: testPassword,
	}
	passwords := &Passwords{
		passwords: []*Password{p},
	}
	result, err := passwords.Export()
	if err != nil {
		t.Fatalf("Expected no error, got %s", err)
	}
	expectedString := `[{"id":"` + testID + `","alias":"` + testAlias + `","username":"` + testUsername + `","password":"` + testPassword + `"}]`
	if !bytes.Equal(result, []byte(expectedString)) {
		t.Fatalf("Expected string representation to be %s, got %s", expectedString, string(result))
	}
}

func TestPasswords_Import(t *testing.T) {
	passwords := &Passwords{}
	err := passwords.Import([]byte(`[{"id":"` + testID + `","alias":"` + testAlias + `","username":"` + testUsername + `","password":"` + testPassword + `"}]`))
	if err != nil {
		t.Fatalf("Expected no error, got %s", err)
	}
	if len(passwords.passwords) != 1 {
		t.Fatalf("Expected passwords to have 1 element, got %d", len(passwords.passwords))
	}
	if passwords.passwords[0].ID != testID {
		t.Fatalf("Expected ID to be %s, got %s", testID, passwords.passwords[0].ID)
	}
	if passwords.passwords[0].Alias != testAlias {
		t.Fatalf("Expected Alias to be %s, got %s", testAlias, passwords.passwords[0].Alias)
	}
	if passwords.passwords[0].Username != testUsername {
		t.Fatalf("Expected Username to be %s, got %s", testUsername, passwords.passwords[0].Username)
	}
	if passwords.passwords[0].Password != testPassword {
		t.Fatalf("Expected Password to be %s, got %s", testPassword, passwords.passwords[0].Password)
	}

	if err := passwords.Import([]byte(`a`)); err == nil {
		t.Fatalf("Expected error, got nil")
	}
}

func TestPasswords_Get(t *testing.T) {
	p := &Password{
		ID:       testID,
		Alias:    testAlias,
		Username: testUsername,
		Password: testPassword,
	}
	passwords := &Passwords{
		passwords: []*Password{p},
	}
	result := passwords.Get(testID)
	if result != p {
		t.Fatalf("Expected %v, got %v", p, result)
	}
	result = passwords.Get("not-existing")
	if result != nil {
		t.Fatalf("Expected nil, got %v", result)
	}
}

func TestPasswords_Set(t *testing.T) {
	passwords := &Passwords{}
	passwords.Set(testAlias, testUsername, testPassword)
	if len(passwords.passwords) != 1 {
		t.Fatalf("Expected passwords to have 1 element, got %d", len(passwords.passwords))
	}
	if passwords.passwords[0].ID != testID {
		t.Fatalf("Expected ID to be %s, got %s", testID, passwords.passwords[0].ID)
	}
	if passwords.passwords[0].Alias != testAlias {
		t.Fatalf("Expected Alias to be %s, got %s", testAlias, passwords.passwords[0].Alias)
	}
	if passwords.passwords[0].Username != testUsername {
		t.Fatalf("Expected Username to be %s, got %s", testUsername, passwords.passwords[0].Username)
	}
	if passwords.passwords[0].Password != testPassword {
		t.Fatalf("Expected Password to be %s, got %s", testPassword, passwords.passwords[0].Password)
	}

	passwords.Set(testAlias, testUsername, "new-password")
	if len(passwords.passwords) != 1 {
		t.Fatalf("Expected passwords to have 1 element, got %d", len(passwords.passwords))
	}
	if passwords.passwords[0].ID != testID {
		t.Fatalf("Expected ID to be %s, got %s", testID, passwords.passwords[0].ID)
	}
	if passwords.passwords[0].Alias != testAlias {
		t.Fatalf("Expected Alias to be %s, got %s", testAlias, passwords.passwords[0].Alias)
	}
	if passwords.passwords[0].Username != testUsername {
		t.Fatalf("Expected Username to be %s, got %s", testUsername, passwords.passwords[0].Username)
	}
	if passwords.passwords[0].Password != "new-password" {
		t.Fatalf("Expected Password to be %s, got %s", "new-password", passwords.passwords[0].Password)
	}
}

func TestPasswords_Del(t *testing.T) {
	passwords := &Passwords{}
	passwords.Set(testAlias, testUsername, testPassword)
	passwords.Del(testID)
	if len(passwords.passwords) != 0 {
		t.Fatalf("Expected passwords to have 0 elements, got %d", len(passwords.passwords))
	}
}
