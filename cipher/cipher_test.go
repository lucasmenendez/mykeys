package cipher

import "testing"

func TestEncryptDecrypt(t *testing.T) {
	input := "example"
	pass := "password"

	encrypted, err := Encrypt([]byte(input), []byte(pass))
	if err != nil {
		t.Fatalf("Expected success during input encryption, got error: %s", err)
	}

	decrypted, err := Decrypt(encrypted, []byte(pass))
	if err != nil {
		t.Fatalf("Expected success during input decryption, got error: %s", err)
	}

	if string(decrypted) != input {
		t.Fatalf("Expected '%s', got '%s'", input, decrypted)
	}
}
