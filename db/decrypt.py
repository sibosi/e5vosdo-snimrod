#!/usr/bin/env python3
import sys
import getpass
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
from cryptography.hazmat.backends import default_backend

def derive_key(password: str, salt: bytes = b'salt', key_length: int = 32) -> bytes:
    kdf = Scrypt(
        salt=salt,
        length=key_length,
        n=16384,
        r=8,
        p=1,
        backend=default_backend()
    )
    return kdf.derive(password.encode())

def decrypt_file(input_path: str, output_path: str, password: str):
    # Read the entire encrypted file content.
    try:
        with open(input_path, 'rb') as f:
            file_content = f.read()
    except Exception as e:
        print(f"Error reading {input_path}: {e}")
        sys.exit(1)

    # Extract the IV (first 12 bytes), the auth tag (last 16 bytes), and the ciphertext in between.
    if len(file_content) < 12 + 16:
        print("File content is too short to contain required IV, ciphertext, and auth tag.")
        sys.exit(1)

    iv = file_content[:12]
    auth_tag = file_content[-16:]
    ciphertext = file_content[12:-16]

    key = derive_key(password)

    # Create AES-GCM cipher for decryption.
    decryptor = Cipher(
        algorithms.AES(key),
        modes.GCM(iv, auth_tag),
        backend=default_backend()
    ).decryptor()

    # Decrypt the ciphertext.
    try:
        plaintext = decryptor.update(ciphertext) + decryptor.finalize()
    except Exception as e:
        print(f"Decryption failed: {e}")
        sys.exit(1)

    # Write the decrypted contents to the output file.
    try:
        with open(output_path, 'wb') as f:
            f.write(plaintext)
    except Exception as e:
        print(f"Error writing {output_path}: {e}")
        sys.exit(1)
        
    print(f"Decryption successful. Output written to {output_path}")

def main():
    # Get user inputs for paths and password.
    input_path = input("Enter the path to the encrypted input file: ").strip()
    output_path = input("Enter the path for the decrypted output file: ").strip()
    password = input("Enter the decryption password: ").strip()

    if not input_path or not output_path or not password:
        print("Input file, output file, and password are required!")
        sys.exit(1)

    decrypt_file(input_path, output_path, password)

if __name__ == "__main__":
    main()