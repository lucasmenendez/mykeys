package base64url

import (
	"encoding/base64"
	"testing"
)

func TestEncodeDecode(t *testing.T) {
	// known value that will be different with base64 and base64url, because
	// the base64 encoding uses the characters +, / and =, which are not URL
	// safe
	input := "<<???>>"
	// get the base64url and base64 encoding and compare them, they should be
	// different
	b64uEncoded := EncodeToString([]byte(input))
	b64Encoded := base64.StdEncoding.EncodeToString([]byte(input))
	if b64uEncoded == b64Encoded {
		t.Errorf("different encoding: %s, %s", b64uEncoded, b64Encoded)
	}
	// decode the base64url and compare it with the input
	b64uDecoded, err := DecodeString(b64uEncoded)
	if err != nil {
		t.Error(err)
	}
	if string(b64uDecoded) != input {
		t.Errorf("expected %s, got %s", input, b64uDecoded)
	}
	// known value that will be the same with base64 and base64url, because
	// the base64 encoding does not unsafe characters for URLs and it does not
	// require padding
	input = "aaaaaa"
	// get the base64url and base64 encoding and compare them, they should be
	// the same
	b64uEncoded = EncodeToString([]byte(input))
	b64Encoded = base64.StdEncoding.EncodeToString([]byte(input))
	if b64uEncoded != b64Encoded {
		t.Errorf("expected %s, got %s", b64Encoded, b64uEncoded)
	}
	// decode the base64url and compare it with the input
	b64uDecoded, err = DecodeString(b64uEncoded)
	if err != nil {
		t.Error(err)
	}
	if string(b64uDecoded) != input {
		t.Errorf("expected %s, got %s", input, b64uDecoded)
	}
	// test last single case with single padding
	input = "<<???>>a"
	// skip coparasion with base64 encoding and just  decode the base64url and
	// compare it with the input
	b64uDecoded, err = DecodeString(EncodeToString([]byte(input)))
	if err != nil {
		t.Error(err)
	}
	if string(b64uDecoded) != input {
		t.Errorf("expected %s, got %s", input, b64uDecoded)
	}
}
