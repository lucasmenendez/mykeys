package base64url

import (
	"encoding/base64"
	"strings"
)

// EncodeToString returns the base64url encoding of src. It uses the standard
// base64 encoding and replaces the characters that are not URL safe (+, /, =).
func EncodeToString(src []byte) string {
	// encode to basic bas64
	rawBase64 := base64.StdEncoding.EncodeToString(src)
	// replace the characters that are not URL safe (+, /, =)
	rawBase64 = strings.ReplaceAll(rawBase64, "+", "-")
	rawBase64 = strings.ReplaceAll(rawBase64, "/", "_")
	return strings.ReplaceAll(rawBase64, "=", "")
}

// DecodeString returns the bytes represented by the base64url encoded string s.
// It recovers the characters that were not URL safe (+, /, =) and uses the
// standard base64 encoding.
func DecodeString(s string) ([]byte, error) {
	// recover the characters that are not URL safe (+, /, =)
	rawBase64 := strings.ReplaceAll(s, "-", "+")
	rawBase64 = strings.ReplaceAll(rawBase64, "_", "/")
	// add the padding character (=) if needed
	switch len(rawBase64) % 4 {
	case 0:
	case 2:
		rawBase64 += "=="
	case 3:
		rawBase64 += "="
	}
	// return the decoded string from basic base64
	return base64.StdEncoding.DecodeString(rawBase64)
}
