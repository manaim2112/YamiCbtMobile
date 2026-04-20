#!/bin/bash

# ============================================
# Script untuk generate keystore dan secrets
# ============================================

KEYSTORE_NAME="yamicbtmobile"
KEYSTORE_FILE="${KEYSTORE_NAME}.keystore"
VALIDITY=10000
KEY_SIZE=2048

echo "=========================================="
echo "YamiCBT Mobile - Keystore Generator"
echo "=========================================="
echo ""

# Prompt untuk password
read -s -p "Masukkan keystore password: " STORE_PASS
echo ""
read -s -p "Konfirmasi password: " STORE_PASS_CONFIRM
echo ""

if [ "$STORE_PASS" != "$STORE_PASS_CONFIRM" ]; then
    echo "ERROR: Password tidak cocok!"
    exit 1
fi

KEY_PASS="$STORE_PASS"  # Gunakan password yang sama untuk key

echo ""
echo "Generating keystore..."

# Generate keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore "$KEYSTORE_FILE" \
  -alias "$KEYSTORE_NAME" \
  -keyalg RSA \
  -keysize $KEY_SIZE \
  -validity $VALIDITY \
  -storepass "$STORE_PASS" \
  -keypass "$KEY_PASS" \
  -dname "CN=YamiCBT Mobile, OU=MTSSupel, O=MTSSupel, L=Indonesia, ST=Indonesia, C=ID"

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "Keystore berhasil dibuat: $KEYSTORE_FILE"
    echo "=========================================="
    echo ""
    
    # Generate base64
    if command -v base64 &> /dev/null; then
        KEYSTORE_BASE64=$(base64 -i "$KEYSTORE_FILE" | tr -d '\n')
        
        echo "=========================================="
        echo "COPY NILAI SECRETS BERIKUT KE GITHUB:"
        echo "=========================================="
        echo ""
        echo "--- KEYSTORE_BASE64 ---"
        echo "$KEYSTORE_BASE64"
        echo ""
        echo "--- KEYSTORE_PASSWORD ---"
        echo "$STORE_PASS"
        echo ""
        echo "--- KEY_ALIAS ---"
        echo "$KEYSTORE_NAME"
        echo ""
        echo "--- KEY_PASSWORD ---"
        echo "$KEY_PASS"
        echo ""
        echo "=========================================="
        echo ""
        echo "File keystore: $KEYSTORE_FILE"
        echo "Simpan file ini di tempat yang AMAN!"
        echo "Jangan commit ke repository!"
        echo "=========================================="
    fi
else
    echo "ERROR: Gagal membuat keystore"
    exit 1
fi
