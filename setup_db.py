#!/usr/bin/env python3
"""
Database Setup Script
Creates database schema and generates template data directly in the database.

IMPORTANT: This script only works with localhost MySQL databases for safety.
"""

import re
import os
import sys
from datetime import datetime
from typing import Dict, List, Tuple
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error

load_dotenv('.env')
SETUP_SQL_FILE_NAME_BEGIN = 'localfile-db_schema_'

def create_db_connection() -> mysql.connector.MySQLConnection:
    """Create and return a MySQL database connection from .env variables."""
    database_name = os.getenv('MYSQL_DATABASE')
    
    try:
        # First connect without specifying a database to check/create it
        connection = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            port=int(os.getenv('MYSQL_PORT', 3306)),
            user=os.getenv('MYSQL_USER'),
            password=os.getenv('MYSQL_PASSWORD')
        )
        
        cursor = connection.cursor()
        
        # Check if database exists
        cursor.execute(f"SHOW DATABASES LIKE '{database_name}'")
        result = cursor.fetchone()
        
        if not result:
            # Database doesn't exist, create it
            print(f'Database "{database_name}" does not exist. Creating...')
            cursor.execute(f"CREATE DATABASE `{database_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f'✓ Database "{database_name}" created successfully')
        else:
            print(f'✓ Database "{database_name}" already exists')
        
        cursor.close()
        connection.close()
        
        # Now connect to the specific database
        connection = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            port=int(os.getenv('MYSQL_PORT', 3306)),
            user=os.getenv('MYSQL_USER'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=database_name
        )
        
        if connection.is_connected():
            return connection
            
    except Error as e:
        print(f'✗ Database connection error: {e}')
        sys.exit(1)


def validate_localhost() -> bool:
    """
    Validate that MYSQL_HOST is set to localhost.
    This prevents accidental modifications to production databases.
    """
    mysql_host = os.getenv('MYSQL_HOST', '').strip().lower()
    
    if not mysql_host:
        print('✗ Error: MYSQL_HOST not set in .env')
        return False
    
    if mysql_host != 'localhost' and mysql_host != '127.0.0.1':
        print('✗ Security Error: This script only works with localhost databases.')
        print(f'  Current MYSQL_HOST: {mysql_host}')
        print('  To prevent accidental data loss, remote database modifications are disabled.')
        return False
    
    return True


def execute_sql(connection: mysql.connector.MySQLConnection, sql: str, description: str = ''):
    """Execute SQL statements directly on the database."""
    cursor = None
    try:
        cursor = connection.cursor()
        
        # Remove DELIMITER commands and DEFINER clauses
        # DELIMITER is a MySQL client command, not server command
        sql_cleaned = re.sub(r'DELIMITER\s+\S+\s*', '', sql, flags=re.IGNORECASE)
        # Remove DEFINER clauses from triggers to avoid user permission issues
        sql_cleaned = re.sub(r'DEFINER\s*=\s*`[^`]+`@`[^`]+`\s+', '', sql_cleaned, flags=re.IGNORECASE)
        
        # Split by semicolon, but handle triggers specially
        statements = []
        current = []
        in_trigger = False
        
        for line in sql_cleaned.split('\n'):
            line_stripped = line.strip()
            
            # Track if we're inside a trigger definition
            if re.search(r'\bCREATE\s+(DEFINER\s*=\s*\S+\s+)?TRIGGER\b', line_stripped, re.IGNORECASE):
                in_trigger = True
            
            current.append(line)
            
            # End of statement
            if line_stripped.endswith(';'):
                if in_trigger:
                    # Triggers end with END; - check if this is it
                    if re.search(r'\bEND\s*;', line_stripped, re.IGNORECASE):
                        in_trigger = False
                        statements.append('\n'.join(current))
                        current = []
                else:
                    # Regular statement
                    statements.append('\n'.join(current))
                    current = []
        
        # Add any remaining content
        if current:
            statements.append('\n'.join(current))
        
        # Execute each statement
        executed = 0
        for statement in statements:
            stmt = statement.strip()
            if stmt and not stmt.startswith('--'):
                try:
                    cursor.execute(stmt)
                    executed += 1
                except Error as e:
                    # Log but continue with other statements
                    # Suppress expected warnings
                    if 'DROP TABLE IF EXISTS' not in stmt and 'SET FOREIGN_KEY_CHECKS' not in stmt and '1050' not in str(e):
                        print(f'  ⚠ Statement error: {str(e)[:100]}')
        
        connection.commit()
        
        if description:
            print(f'  ✓ {description} ({executed} statements executed)')
        return True
        
    except Error as e:
        connection.rollback()
        print(f'✗ SQL execution error: {e}')
        return False
    finally:
        if cursor:
            cursor.close()


def reorder_tables_by_dependencies(schema: str) -> str:
    """Reorder CREATE TABLE statements to resolve foreign key dependencies."""
    # Extract all table definitions with their dependencies
    table_blocks = {}
    table_dependencies = {}
    
    # Split schema into sections
    lines = schema.split('\n')
    current_table = None
    current_block = []
    in_create_table = False
    
    for line in lines:
        # Detect CREATE TABLE
        table_match = re.search(r'CREATE TABLE `?(\w+)`?', line, re.IGNORECASE)
        if table_match:
            # Save previous table if exists
            if current_table and current_block:
                table_blocks[current_table] = '\n'.join(current_block)
            
            current_table = table_match.group(1)
            current_block = [line]
            table_dependencies[current_table] = set()
            in_create_table = True
            continue
        
        if in_create_table:
            current_block.append(line)
            
            # Extract FOREIGN KEY references
            fk_match = re.search(r'REFERENCES\s+`?(\w+)`?', line, re.IGNORECASE)
            if fk_match:
                referenced_table = fk_match.group(1)
                table_dependencies[current_table].add(referenced_table)
            
            # End of CREATE TABLE
            if re.search(r'\)\s*ENGINE', line, re.IGNORECASE):
                in_create_table = False
    
    # Save last table
    if current_table and current_block:
        table_blocks[current_table] = '\n'.join(current_block)
    
    # Topological sort
    sorted_tables = []
    visited = set()
    
    def visit(table):
        if table in visited or table not in table_blocks:
            return
        visited.add(table)
        # Visit dependencies first
        for dep in table_dependencies.get(table, []):
            visit(dep)
        sorted_tables.append(table)
    
    # Visit all tables
    for table in table_blocks.keys():
        visit(table)
    
    # Rebuild schema with sorted tables
    result = []
    
    # Add header
    result.append('-- Database Schema Dump')
    result.append('-- Reordered for dependency resolution')
    result.append('')
    result.append('SET FOREIGN_KEY_CHECKS=0;')
    result.append('')
    
    # Add tables in dependency order
    for table in sorted_tables:
        result.append(f'-- Table: {table}')
        result.append(f'DROP TABLE IF EXISTS `{table}`;')
        result.append(table_blocks[table])
        result.append('')
    
    # Add only triggers from original schema (not CREATE TABLE statements)
    trigger_matches = re.finditer(r'(-- Trigger:.*?DROP TRIGGER.*?END;)', schema, re.DOTALL)
    for trigger_match in trigger_matches:
        result.append(trigger_match.group(1))
        result.append('')
    
    result.append('SET FOREIGN_KEY_CHECKS=1;')
    
    return '\n'.join(result)


def import_and_create_schema(connection: mysql.connector.MySQLConnection) -> str:
    """Import schema from local SQL file and execute it directly in the database."""
    files = [f for f in os.listdir('.') if f.startswith(SETUP_SQL_FILE_NAME_BEGIN) and f.endswith('.sql')]
    if not files:
        print(f'✗ No schema file found starting with {SETUP_SQL_FILE_NAME_BEGIN} in the current directory.')
        sys.exit(1)
    latest_file = max(files, key=os.path.getctime)
    print(f'✓ Using schema file: {latest_file}')
    
    with open(latest_file, 'r', encoding='utf-8') as file:
        schema = file.read()
    
    # Reorder CREATE TABLE statements to resolve foreign key dependencies
    schema_reordered = reorder_tables_by_dependencies(schema)
    
    # Execute schema creation directly
    print('Executing schema creation...')
    
    # Count tables created for verification
    cursor = connection.cursor()
    cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE()")
    tables_before = cursor.fetchone()[0]
    cursor.close()
    
    success = execute_sql(connection, schema_reordered, 'Schema created')
    
    cursor = connection.cursor()
    cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE()")
    tables_after = cursor.fetchone()[0]
    cursor.close()
    
    print(f'  ✓ Created {tables_after - tables_before} tables')
    
    if not success or tables_after == tables_before:
        print('  ⚠ Warning: Schema creation may have failed partially')
    
    return schema


def parse_create_table(create_stmt: str) -> Tuple[str, List[Dict]]:
    """
    Parse CREATE TABLE statement to extract table name and columns.
    Returns: (table_name, [{'name': str, 'type': str, 'nullable': bool, 'default': str}])
    """
    # Extract table name
    table_match = re.search(r'CREATE TABLE `?(\w+)`?', create_stmt, re.IGNORECASE)
    if not table_match:
        return None, []
    
    table_name = table_match.group(1)
    
    # Extract column definitions - improved pattern
    columns = []
    
    # Find the column definitions section (between first ( and ENGINE)
    col_section_match = re.search(r'\((.*?)\)\s*ENGINE', create_stmt, re.DOTALL | re.IGNORECASE)
    if not col_section_match:
        return table_name, []
    
    col_section = col_section_match.group(1)
    
    # Split by comma, but be careful with nested parentheses
    lines = col_section.split('\n')
    
    for line in lines:
        line_stripped = line.strip()
        
        # Skip empty lines and comments
        if not line_stripped or line_stripped.startswith('--'):
            continue
        
        # Skip constraints, keys, and checks
        if re.match(r'(PRIMARY KEY|UNIQUE KEY|KEY|FOREIGN KEY|CONSTRAINT|CHECK)\s*\(', line_stripped, re.IGNORECASE):
            continue
        
        # Column pattern: starts with backtick, has name and type
        col_match = re.match(r'`(\w+)`\s+(\w+(?:\([^\)]+\))?)\s*(.*?)(?:,\s*)?$', line_stripped)
        if not col_match:
            continue
        
        col_name = col_match.group(1)
        col_type = col_match.group(2).upper()
        col_attrs = col_match.group(3).upper()
        
        # Skip auto-increment columns and generated columns
        if 'AUTO_INCREMENT' in col_attrs or 'GENERATED ALWAYS' in col_attrs:
            continue
        
        nullable = 'NOT NULL' not in col_attrs
        
        # Extract default value
        default_match = re.search(r"DEFAULT\s+('([^']*)'|(\w+))", col_attrs)
        default_value = None
        if default_match:
            default_value = default_match.group(2) or default_match.group(3)
        
        columns.append({
            'name': col_name,
            'type': col_type,
            'nullable': nullable,
            'default': default_value
        })
    
    return table_name, columns


def generate_template_value(col_type: str, col_name: str) -> str:
    """Generate a template value based on column type and name."""
    col_type_base = col_type.split('(')[0]
    
    # Integer types
    if col_type_base in ['INT', 'BIGINT', 'SMALLINT', 'TINYINT', 'MEDIUMINT']:
        return '1'
    
    # Floating point
    if col_type_base in ['FLOAT', 'DOUBLE', 'DECIMAL']:
        return '1.0'
    
    # Boolean
    if col_type_base in ['BOOLEAN', 'BOOL']:
        return '0'
    
    # Date/Time
    if col_type_base == 'DATE':
        return f"'{datetime.now().strftime('%Y-%m-%d')}'"
    if col_type_base == 'DATETIME' or col_type_base == 'TIMESTAMP':
        return f"'{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}'"
    if col_type_base == 'TIME':
        return "'12:00:00'"
    if col_type_base == 'YEAR':
        return f"'{datetime.now().year}'"
    
    # Text types
    if col_type_base in ['VARCHAR', 'CHAR', 'TEXT', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT']:
        # Generate meaningful names based on column name
        if 'email' in col_name.lower():
            return "'example@example.com'"
        if 'name' in col_name.lower():
            return "'Sample Name'"
        if 'title' in col_name.lower():
            return "'Sample Title'"
        if 'description' in col_name.lower():
            return "'Sample description'"
        if 'url' in col_name.lower() or 'link' in col_name.lower():
            return "'https://example.com'"
        if 'phone' in col_name.lower():
            return "'+3600000000'"
        if 'om' in col_name.lower():
            return "'12345678901'"  # 11 character OM code
        if 'code' in col_name.lower() and 'ejg' in col_name.lower():
            return "'2023C25EJG000'"  # 13 character EJG code
        return "'sample_value'"
    
    # JSON
    if col_type_base == 'JSON':
        return "'{}'"
    
    # Binary
    if col_type_base in ['BLOB', 'BINARY', 'VARBINARY']:
        return "NULL"
    
    # Enum/Set
    if col_type_base in ['ENUM', 'SET']:
        # Extract first value from ENUM/SET definition
        enum_match = re.search(r"'([^']+)'", col_type)
        if enum_match:
            return f"'{enum_match.group(1)}'"
        return "NULL"
    
    # Default
    return "'sample'"


def generate_and_insert_template_data(connection: mysql.connector.MySQLConnection, schema: str):
    """Generate template data and insert it directly into the database."""
    print('\nGenerating and inserting template data...')
    
    # Disable foreign key checks temporarily
    cursor = connection.cursor()
    cursor.execute('SET FOREIGN_KEY_CHECKS=0')
    cursor.close()
    
    # Split schema by CREATE TABLE statements
    create_table_pattern = r'CREATE TABLE `?(\w+)`?.*?(?=CREATE TABLE|DROP TRIGGER|SET FOREIGN_KEY_CHECKS|$)'
    table_matches = list(re.finditer(create_table_pattern, schema, re.DOTALL | re.IGNORECASE))
    
    insert_count = 0
    for i, match in enumerate(table_matches):
        table_name = match.group(1)
        create_stmt = match.group(0)
        
        # Skip if it's just a comment or incomplete statement
        if 'CREATE TABLE' not in create_stmt.upper():
            continue
        
        parsed_table, columns = parse_create_table(create_stmt)
        
        if not columns:
            continue
        
        # Generate and execute INSERT statement
        col_names = [col['name'] for col in columns]
        col_values = []
        
        for col in columns:
            if col['default'] is not None and col['default'] != 'NULL':
                # Handle special default values
                if col['default'].upper() == 'CURRENT_TIMESTAMP':
                    col_values.append(f"'{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}'")
                else:
                    col_values.append(col['default'] if col['default'].startswith("'") else f"'{col['default']}'")
            elif col['nullable']:
                col_values.append('NULL')
            else:
                col_values.append(generate_template_value(col['type'], col['name']))
        
        insert_stmt = f"INSERT INTO `{table_name}` ({', '.join(f'`{c}`' for c in col_names)}) VALUES ({', '.join(col_values)});"
        
        cursor = connection.cursor()
        try:
            cursor.execute(insert_stmt)
            connection.commit()
            print(f'  ✓ Inserted template data into {table_name}')
            insert_count += 1
        except Error as e:
            connection.rollback()
            print(f'  ⚠ Skipped {table_name}: {e}')
        finally:
            cursor.close()
    
    # Re-enable foreign key checks
    cursor = connection.cursor()
    cursor.execute('SET FOREIGN_KEY_CHECKS=1')
    cursor.close()
    
    print(f'✓ Generated and inserted template data for {insert_count} tables')


def create_admin_user(connection: mysql.connector.MySQLConnection):
    """Create a default admin user (john@doe.hu) with admin, user, and student permissions."""
    print('\nCreating default admin user...')
    
    cursor = connection.cursor()
    try:
        # Check if user already exists
        cursor.execute("SELECT email FROM users WHERE email = 'john@doe.hu'")
        if cursor.fetchone():
            print('  ℹ User john@doe.hu already exists, skipping')
            return
        
        # Create admin user with all permissions
        insert_query = """
        INSERT INTO users (
            name, full_name, username, email, image, 
            EJG_code, class, last_login, 
            permissions, notifications, nickname, 
            push_permission, is_verified
        ) VALUES (
            'John Doe', 'John Doe Admin', 'johndoe', 'john@doe.hu',
            'https://lh3.googleusercontent.com/a/default-user',
            '2023C25EJG000', '9.C', %s,
            %s, '[]', 'Nimi',
            1, 1
        )
        """
        
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        permissions_json = '["admin", "user", "student"]'
        
        cursor.execute(insert_query, (current_time, permissions_json))
        connection.commit()
        print('  ✓ Created admin user: john@doe.hu')
        print('    Permissions: admin, user, student')
        
    except Error as e:
        connection.rollback()
        print(f'  ⚠ Could not create admin user: {e}')
    finally:
        cursor.close()


def main():
    """Main execution."""
    print('=' * 60)
    print('Database Setup Script')
    print('=' * 60)
    
    # Validate localhost safety check
    if not validate_localhost():
        print('\n✗ Setup script terminated for security reasons.')
        sys.exit(1)
    
    # Create database connection
    print('\nConnecting to database...')
    connection = create_db_connection()
    print('✓ Database connected')
    
    try:
        # Check if database already has tables
        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE()")
        existing_tables = cursor.fetchone()[0]
        
        if existing_tables > 0:
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY table_name")
            table_names = [row[0] for row in cursor.fetchall()]
            cursor.close()
            
            print(f'\n⚠ Warning: Database already contains {existing_tables} table(s):')
            for i, table in enumerate(table_names[:10], 1):
                print(f'  {i}. {table}')
            if len(table_names) > 10:
                print(f'  ... and {len(table_names) - 10} more')
            
            print('\nOptions:')
            print('  1. Drop all existing tables and recreate schema (RECOMMENDED)')
            print('  2. Keep existing tables and try to add new ones')
            print('  3. Cancel and exit')
            
            choice = input('\nEnter your choice (1/2/3): ').strip()
            
            if choice == '1':
                print('\nDropping all existing tables...')
                cursor = connection.cursor()
                cursor.execute('SET FOREIGN_KEY_CHECKS=0')
                for table in table_names:
                    try:
                        cursor.execute(f'DROP TABLE IF EXISTS `{table}`')
                        print(f'  ✓ Dropped {table}')
                    except Error as e:
                        print(f'  ⚠ Could not drop {table}: {e}')
                cursor.execute('SET FOREIGN_KEY_CHECKS=1')
                connection.commit()
                cursor.close()
                print('✓ All tables dropped')
            elif choice == '3':
                print('\n✗ Setup cancelled by user.')
                sys.exit(0)
            # choice == '2' continues without dropping
        else:
            cursor.close()
        
        # Step 1: Import and create schema
        schema = import_and_create_schema(connection)
        
        # Step 2: Generate and insert template data
        generate_and_insert_template_data(connection, schema)
        
        # Step 3: Create default admin user
        create_admin_user(connection)
        
        print('\n' + '=' * 60)
        print('✓ Setup completed successfully!')
        print('=' * 60)
        print(f'\nDatabase: {os.getenv("MYSQL_DATABASE")}')
        print(f'Host: {os.getenv("MYSQL_HOST")}')
        print('Schema and template data have been created directly in the database.')
        
    finally:
        if connection.is_connected():
            connection.close()
            print('\n✓ Database connection closed')


if __name__ == '__main__':
    main()
