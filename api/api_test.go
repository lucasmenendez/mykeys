package api

import "testing"

const (
	testID        = "5cd0baaeadbb55c8f432ad227bd8d96c"
	testAlias     = "alias"
	testUsername  = "username"
	testPassword  = "password"
	testPassphase = "passphrase"
)

func TestNew(t *testing.T) {
	api := New(testPassphase)
	if api == nil {
		t.Fatalf("Expected API to be created, got nil")
	}
	if string(api.passphrase) != testPassphase {
		t.Fatalf("Expected passphrase to be %s, got %s", testPassphase, api.passphrase)
	}
	if api.passwords == nil {
		t.Fatalf("Expected passwords to be created, got nil")
	}
}

func TestAPI_ImportExport(t *testing.T) {
	api := New(testPassphase)
	if err := api.Import("a"); err == nil {
		t.Fatalf("Expected error, got nil")
	}

	emptyDump, err := api.Export()
	if err != nil {
		t.Fatalf("Expected no error, got %s", err)
	}

	api.passphrase = []byte("wrong")

	if err := api.Import(emptyDump); err == nil {
		t.Fatal("Expected error, got nil")
	}

	api.passphrase = []byte(testPassphase)
	api.Set(testAlias, testUsername, testPassword)

	dump, err := api.Export()
	if err != nil {
		t.Fatalf("Expected no error, got %s", err)
	}
	if dump == "" {
		t.Fatalf("Expected dump to be not empty, got empty")
	}

	if err := api.Import(dump); err != nil {
		t.Fatalf("Expected no error, got %s", err)
	}
	if l := len(api.passwords.List()); l != 1 {
		t.Fatalf("Expected passwords to have 1 element, got %d", l)
	}

	if api.passwords.List()[0].Alias != testAlias {
		t.Fatalf("Expected alias to be %s, got %s", testAlias, api.passwords.List()[0].Alias)
	}
	if api.passwords.List()[0].Username != testUsername {
		t.Fatalf("Expected username to be %s, got %s", testUsername, api.passwords.List()[0].Username)
	}
	if api.passwords.List()[0].Password != testPassword {
		t.Fatalf("Expected password to be %s, got %s", testPassword, api.passwords.List()[0].Password)
	}

	api.passphrase = []byte{}
	if _, err := api.Export(); err == nil {
		t.Fatalf("Expected error, got nil")
	}
}

func TestAPI_SetDel(t *testing.T) {
	api := New(testPassphase)
	api.Set(testAlias, testUsername, testPassword)
	if l := len(api.passwords.List()); l != 1 {
		t.Fatalf("Expected passwords to have 1 element, got %d", l)
	}
	if api.passwords.List()[0].ID != testID {
		t.Fatalf("Expected ID to be %s, got %s", testID, api.passwords.List()[0].ID)
	}
	api.Del(testID)
	if l := len(api.passwords.List()); l != 0 {
		t.Fatalf("Expected passwords to have 0 elements, got %d", l)
	}
}

func TestAPI_Get(t *testing.T) {
	api := New(testPassphase)
	api.Set(testAlias, testUsername, testPassword)
	expectedStr := "[" + testID + "] " + testAlias + " -> " + testUsername + ":" + testPassword + "\n"
	if resultStr := api.Get(testID, false); resultStr != expectedStr {
		t.Fatalf("Expected %s, got %s", expectedStr, resultStr)
	}
	expectedJSON := `{"id":"` + testID + `","alias":"` + testAlias + `","username":"` + testUsername + `","password":"` + testPassword + `"}`
	if resultJSON := api.Get(testID, true); resultJSON != expectedJSON {
		t.Fatalf("Expected %s, got %s", expectedJSON, resultJSON)
	}
	if resultStr := api.Get("not-existing", false); resultStr != "" {
		t.Fatalf("Expected empty string, got %s", resultStr)
	}
	if resultJSON := api.Get("not-existing", true); resultJSON != "" {
		t.Fatalf("Expected empty string, got %s", resultJSON)
	}
}

func TestAPI_List(t *testing.T) {
	api := New(testPassphase)
	api.Set(testAlias, testUsername, testPassword)
	expectedStr := "[" + testID + "] " + testAlias + " -> " + testUsername + ":" + testPassword + "\n"
	if resultStr := api.List(false); resultStr != expectedStr {
		t.Fatalf("Expected %s, got %s", expectedStr, resultStr)
	}
	expectedJSON := `[{"id":"` + testID + `","alias":"` + testAlias + `","username":"` + testUsername + `","password":"` + testPassword + `"}]`
	if resultJSON := api.List(true); resultJSON != expectedJSON {
		t.Fatalf("Expected %s, got %s", expectedJSON, resultJSON)
	}
}
