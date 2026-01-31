#!/usr/bin/env python3
"""
Setup Script for e5vosdo-snimrod

This script orchestrates the setup process by running:
1. setup_dotenv.py - Environment file setup
2. setup_db.py - Database setup

IMPORTANT: Before running, download the schema from:
https://e5vosdo.hu/api/admin/export-schema
and save as localfile-db_schema_*.sql in this directory
"""

import subprocess
import sys
from pathlib import Path


def run_script(script_name: str) -> bool:
    """Run a setup script and return success status."""
    try:
        result = subprocess.run(
            [sys.executable, script_name],
            cwd=Path(__file__).parent
        )
        return result.returncode == 0
    except Exception as e:
        print(f'✗ Error running {script_name}: {e}')
        return False


def main():
    """Main execution."""
    print('=' * 60)
    print('e5vosdo-snimrod Setup')
    print('=' * 60)
    
    # Step 1: Environment setup
    print('\n📝 Step 1: Setting up .env file...\n')
    if not run_script('setup_dotenv.py'):
        print('\n✗ .env setup failed')
        sys.exit(1)
    
    # Step 2: Database setup
    print('\n\n🗄️  Step 2: Database setup...\n')
    if not run_script('setup_db.py'):
        print('\n⚠️  Database setup encountered issues')
    
    # Completion
    print('\n' + '=' * 60)
    print('✓ Setup completed!')
    print('=' * 60)
    print('\n📖 Next steps:')
    print('  1. Configure remaining .env variables')
    print('  2. Run: npm install && npm run dev')
    print('=' * 60 + '\n')


if __name__ == '__main__':
    main()
