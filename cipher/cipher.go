package cipher

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/md5"
	"crypto/rand"
	"io"
)

// hashFunc returns the md5 hash of the given raw data. It is used to generate
// the key for the cipher based on the passphrase provided by the user.
func hashFunc(raw []byte) []byte {
	hasher := md5.New()
	hasher.Write([]byte(raw))
	return hasher.Sum(nil)
}

// Encrypt encrypts the given data using the passphrase provided by the user.
func Encrypt(data, passphrase []byte) ([]byte, error) {
	// create the cipher block with the hash of the passphrase provided by the
	// user
	block, err := aes.NewCipher(hashFunc(passphrase))
	if err != nil {
		return nil, err
	}
	// create the gcm cipher with the block created above
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	// create a slice of bytes with the size of the nonce and fill it with
	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}
	// return the encrypted data with the nonce bytes prepended
	return gcm.Seal(nonce, nonce, data, nil), nil
}

// Decrypt decrypts the given data using the passphrase provided by the user.
func Decrypt(data, passphrase []byte) ([]byte, error) {
	// create the cipher block with the hash of the passphrase provided by the
	// user
	block, err := aes.NewCipher(hashFunc(passphrase))
	if err != nil {
		return nil, err
	}
	// create the gcm cipher with the block created above
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	// get the nonce size
	nonceSize := gcm.NonceSize()
	// get the nonce and the ciphertext from the data slice, the nonce is the
	// first nonceSize bytes and the ciphertext is the rest
	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	// decrypt the ciphertext with the nonce using the gcm cipher
	result, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}
	return result, nil
}
