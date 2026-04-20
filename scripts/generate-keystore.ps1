# ============================================
# Script untuk generate keystore dan secrets (Windows PowerShell)
# ============================================

$KEYSTORE_NAME = "yamicbtmobile"
$KEYSTORE_FILE = "${KEYSTORE_NAME}.keystore"
$VALIDITY = 10000
$KEY_SIZE = 2048

Write-Host "=========================================="
Write-Host "YamiCBT Mobile - Keystore Generator"
Write-Host "=========================================="
Write-Host ""

# Cari keytool (Java)
$KEYTOOL = $null

# 1. Cek di PATH
$keytoolInPath = Get-Command keytool -ErrorAction SilentlyContinue
if ($keytoolInPath) {
    $KEYTOOL = "keytool"
    Write-Host "Found keytool in PATH" -ForegroundColor Green
}

# 2. Cek di JAVA_HOME
if (-not $KEYTOOL -and $env:JAVA_HOME) {
    $keytoolPath = Join-Path $env:JAVA_HOME "bin\keytool.exe"
    if (Test-Path $keytoolPath) {
        $KEYTOOL = $keytoolPath
        Write-Host "Found keytool in JAVA_HOME: $keytoolPath" -ForegroundColor Green
    }
}

# 3. Cek di Android Studio (lokasi umum)
$androidStudioPaths = @(
    "${env:LOCALAPPDATA}\Android\Sdk\..\jbr\bin\keytool.exe",
    "${env:LOCALAPPDATA}\Android\Sdk\..\jre\bin\keytool.exe",
    "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe",
    "C:\Program Files\Android\Android Studio\jre\bin\keytool.exe",
    "${env:LOCALAPPDATA}\Programs\Android Studio\jbr\bin\keytool.exe"
)

if (-not $KEYTOOL) {
    foreach ($path in $androidStudioPaths) {
        if (Test-Path $path) {
            $KEYTOOL = $path
            Write-Host "Found keytool in Android Studio: $path" -ForegroundColor Green
            break
        }
    }
}

# 4. Cek di Program Files Java
if (-not $KEYTOOL) {
    $javaDirs = Get-ChildItem "C:\Program Files\Java" -ErrorAction SilentlyContinue
    foreach ($dir in $javaDirs) {
        $keytoolPath = Join-Path $dir.FullName "bin\keytool.exe"
        if (Test-Path $keytoolPath) {
            $KEYTOOL = $keytoolPath
            Write-Host "Found keytool in: $keytoolPath" -ForegroundColor Green
            break
        }
    }
}

if (-not $KEYTOOL) {
    Write-Host ""
    Write-Host "ERROR: keytool tidak ditemukan!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pastikan salah satu sudah terinstall:"
    Write-Host "  1. Java JDK (https://adoptium.net/)"
    Write-Host "  2. Android Studio"
    Write-Host ""
    Write-Host "Atau jalankan manual:"
    Write-Host "  keytool -genkeypair -v -storetype PKCS12 -keystore $KEYSTORE_FILE -alias $KEYSTORE_NAME -keyalg RSA -keysize 2048 -validity $VALIDITY"
    Write-Host ""
    exit 1
}

# Prompt untuk password
$STORE_PASS = Read-Host -Prompt "Masukkan keystore password" -AsSecureString
$STORE_PASS_BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($STORE_PASS)
$STORE_PASS_PLAIN = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($STORE_PASS_BSTR)

$STORE_PASS_CONFIRM = Read-Host -Prompt "Konfirmasi password" -AsSecureString
$STORE_PASS_CONFIRM_BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($STORE_PASS_CONFIRM)
$STORE_PASS_CONFIRM_PLAIN = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($STORE_PASS_CONFIRM_BSTR)

if ($STORE_PASS_PLAIN -ne $STORE_PASS_CONFIRM_PLAIN) {
    Write-Host "ERROR: Password tidak cocok!" -ForegroundColor Red
    exit 1
}

$KEY_PASS = $STORE_PASS_PLAIN

Write-Host ""
Write-Host "Generating keystore..."

# Generate keystore
$dname = "CN=YamiCBT Mobile, OU=MTSSupel, O=MTSSupel, L=Indonesia, ST=Indonesia, C=ID"
$keytoolArgs = @(
    "-genkeypair", "-v",
    "-storetype", "PKCS12",
    "-keystore", $KEYSTORE_FILE,
    "-alias", $KEYSTORE_NAME,
    "-keyalg", "RSA",
    "-keysize", $KEY_SIZE,
    "-validity", $VALIDITY,
    "-storepass", $STORE_PASS_PLAIN,
    "-keypass", $KEY_PASS,
    "-dname", $dname
)

& $KEYTOOL $keytoolArgs

if ($LASTEXITCODE -eq 0 -and (Test-Path $KEYSTORE_FILE)) {
    Write-Host ""
    Write-Host "=========================================="
    Write-Host "Keystore berhasil dibuat: $KEYSTORE_FILE"
    Write-Host "=========================================="
    Write-Host ""
    
    # Generate base64
    $KEYSTORE_BASE64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("$PWD\$KEYSTORE_FILE"))
    
    Write-Host "=========================================="
    Write-Host "COPY NILAI SECRETS BERIKUT KE GITHUB:"
    Write-Host "=========================================="
    Write-Host ""
    Write-Host "--- KEYSTORE_BASE64 ---"
    Write-Host $KEYSTORE_BASE64
    Write-Host ""
    Write-Host "--- KEYSTORE_PASSWORD ---"
    Write-Host $STORE_PASS_PLAIN
    Write-Host ""
    Write-Host "--- KEY_ALIAS ---"
    Write-Host $KEYSTORE_NAME
    Write-Host ""
    Write-Host "--- KEY_PASSWORD ---"
    Write-Host $KEY_PASS
    Write-Host ""
    Write-Host "=========================================="
    Write-Host ""
    Write-Host "File keystore: $KEYSTORE_FILE"
    Write-Host "Simpan file ini di tempat yang AMAN!"
    Write-Host "Jangan commit ke repository!"
    Write-Host "=========================================="
} else {
    Write-Host "ERROR: Gagal membuat keystore" -ForegroundColor Red
    exit 1
}
