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

	if _, err = Decrypt(encrypted, []byte("wrong")); err == nil {
		t.Fatalf("Expected error during decryption, got nil")
	}
	if _, err = Decrypt(encrypted, nil); err == nil {
		t.Fatalf("Expected error during decryption, got nil")
	}
	if _, err = Encrypt([]byte(input), nil); err == nil {
		t.Fatalf("Expected error during encryption, got nil")
	}
	if _, err = Encrypt(nil, []byte(pass)); err != nil {
		t.Fatalf("Expected nil, got error: %s", err)
	}
}
