#!/usr/bin/env python3
"""
.env File Setup Script
Generates required environment variables and creates .env file from .env.example

This script will:
1. Generate secure random values for AUTH_SECRET, ENCRYPTION_PASSWORD, VAPID keys
2. Copy .env.example to .env if it doesn't exist
3. Fill in generated values
"""

import os
import sys
import secrets
import base64
from pathlib import Path


def generate_auth_secret() -> str:
    """Generate AUTH_SECRET using base64 encoding (32 bytes)."""
    return base64.b64encode(secrets.token_bytes(32)).decode('utf-8')


def generate_encryption_password() -> str:
    """Generate a strong ENCRYPTION_PASSWORD (32 characters)."""
    # Mix of letters, numbers, and symbols
    alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    return ''.join(secrets.choice(alphabet) for _ in range(32))


def generate_vapid_keys() -> tuple[str, str]:
    """
    Generate VAPID keys for web push notifications.
    Note: This is a simplified version. For production, use: npx web-push generate-vapid-keys
    """
    try:
        # Try to use py_vapid if available
        from py_vapid import Vapid
        from cryptography.hazmat.primitives import serialization
        import base64
        
        vapid = Vapid()
        vapid.generate_keys()
        
        # Export public key in base64url format (uncompressed point)
        public_bytes = vapid.public_key.public_bytes(
            encoding=serialization.Encoding.X962,
            format=serialization.PublicFormat.UncompressedPoint
        )
        public_key = base64.urlsafe_b64encode(public_bytes).decode('utf-8').rstrip('=')
        
        # Extract raw private key value (32 bytes for P-256)
        private_value = vapid.private_key.private_numbers().private_value
        private_bytes = private_value.to_bytes(32, byteorder='big')
        private_key = base64.urlsafe_b64encode(private_bytes).decode('utf-8').rstrip('=')
        
        return public_key, private_key
    except ImportError:
        print('  ℹ py-vapid not installed. Generating placeholder VAPID keys.')
        print('    Install with: pip install py-vapid')
        print('    Or generate manually: npx web-push generate-vapid-keys')
        return '', ''


def read_env_example() -> str:
    """Read .env.example file content."""
    env_example_path = Path('.env.example')
    
    if not env_example_path.exists():
        print('✗ Error: .env.example file not found')
        sys.exit(1)
    
    with open(env_example_path, 'r', encoding='utf-8') as f:
        return f.read()


def read_existing_env() -> dict:
    """Read existing .env file and extract key=value pairs."""
    env_path = Path('.env')
    env_values = {}
    
    if not env_path.exists():
        return env_values
    
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue
            # Parse key=value
            if '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                # Remove inline comments from value
                if '#' in value:
                    value = value.split('#')[0]
                value = value.strip()
                # Only keep if value is non-empty (not just # or empty)
                if key and value:
                    env_values[key] = value
    
    return env_values


def create_env_file(content: str, generated_values: dict, preserve_existing: bool = False, existing_values: dict = None):
    """Create .env file with generated values, optionally preserving existing values."""
    env_path = Path('.env')
    
    if existing_values is None:
        existing_values = {}
    
    # Replace placeholders with generated values
    for key, value in generated_values.items():
        # Skip if preserving and value exists
        if preserve_existing and key in existing_values:
            print(f'  ⊘ Keeping existing {key} value')
            continue
        
        if value:
            # Find lines like: # KEY= or KEY=
            content = content.replace(f'# {key}=', f'{key}={value}')
            # Also replace if already has value
            import re
            content = re.sub(f'^{key}=.*$', f'{key}={value}', content, flags=re.MULTILINE)
    
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(content)


def main():
    """Main execution."""
    print('=' * 60)
    print('.env File Setup Script')
    print('=' * 60)
    
    env_path = Path('.env')
    existing_values = {}
    choice = None
    
    # Check if .env already exists
    if env_path.exists():
        existing_values = read_existing_env()
        print('\n⚠ Warning: .env file already exists')
        print('\nOptions:')
        print('  1. Keep existing values, only generate missing ones (RECOMMENDED)')
        print('  2. Backup existing .env and create new one')
        print('  3. Cancel and exit')
        
        choice = input('\nEnter your choice (1/2/3): ').strip()
        
        if choice == '2':
            backup_path = Path('.env.backup')
            counter = 1
            while backup_path.exists():
                backup_path = Path(f'.env.backup.{counter}')
                counter += 1
            
            os.rename(env_path, backup_path)
            print(f'✓ Backed up existing .env to {backup_path}')
            existing_values = {}  # Clear existing values since we're starting fresh
        elif choice == '3':
            print('\n✗ Setup cancelled by user.')
            sys.exit(0)
        # choice == '1' continues to preserve existing
    
    print('\nGenerating secure values...')
    
    # Generate values
    auth_secret = generate_auth_secret()
    if 'AUTH_SECRET' in existing_values and choice == '1':
        print('  ⊘ Keeping existing AUTH_SECRET')
        auth_secret = existing_values['AUTH_SECRET']
    else:
        print(f'  ✓ Generated AUTH_SECRET: {auth_secret[:20]}...')
    
    encryption_password = generate_encryption_password()
    if 'ENCRYPTION_PASSWORD' in existing_values and choice == '1':
        print('  ⊘ Keeping existing ENCRYPTION_PASSWORD')
        encryption_password = existing_values['ENCRYPTION_PASSWORD']
    else:
        print(f'  ✓ Generated ENCRYPTION_PASSWORD: {encryption_password[:20]}...')
    
    public_vapid, private_vapid = generate_vapid_keys()
    if public_vapid and private_vapid:
        if 'PUBLIC_VAPID_KEY' in existing_values and choice == '1':
            print('  ⊘ Keeping existing PUBLIC_VAPID_KEY')
            public_vapid = existing_values['PUBLIC_VAPID_KEY']
        else:
            print(f'  ✓ Generated PUBLIC_VAPID_KEY: {public_vapid[:20]}...')
        
        if 'PRIVATE_VAPID_KEY' in existing_values and choice == '1':
            print('  ⊘ Keeping existing PRIVATE_VAPID_KEY')
            private_vapid = existing_values['PRIVATE_VAPID_KEY']
        else:
            print(f'  ✓ Generated PRIVATE_VAPID_KEY: {private_vapid[:20]}...')
    
    generated_values = {
        'AUTH_SECRET': auth_secret,
        'ENCRYPTION_PASSWORD': encryption_password,
    }
    
    if public_vapid and private_vapid:
        generated_values['PUBLIC_VAPID_KEY'] = public_vapid
        generated_values['PRIVATE_VAPID_KEY'] = private_vapid
    
    # Read .env.example or existing .env
    if env_path.exists() and choice == '1':
        print('\nUpdating existing .env file...')
        with open(env_path, 'r', encoding='utf-8') as f:
            content = f.read()
    else:
        print('\nCreating .env from .env.example...')
        content = read_env_example()
    
    # Create/update .env file
    create_env_file(content, generated_values, preserve_existing=(choice == '1'), existing_values=existing_values)
    
    print('\n' + '=' * 60)
    print('✓ Setup completed successfully!')
    print('=' * 60)
    print(f'\n.env file location: {env_path.absolute()}')
    print('\nGenerated values:')
    for key in generated_values:
        if choice == '1' and key in existing_values:
            print(f'  • {key} (preserved)')
        else:
            print(f'  • {key}')
    
    print('\n⚠ Important: You still need to configure:')
    print('  • Database credentials (MYSQL_*)')
    print('  • Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)')
    print('  • Google Drive API keys and folder IDs')
    print('  • Supabase credentials')
    print('  • Service Account keys')
    
    print('\n📖 See comments in .env for details on how to obtain these values.')


if __name__ == '__main__':
    main()
