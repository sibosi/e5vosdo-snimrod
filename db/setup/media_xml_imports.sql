-- Create table for tracking XML imports
-- This allows the system to recognize if an XML file has already been imported
CREATE TABLE
    IF NOT EXISTS media_xml_imports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        drive_id VARCHAR(255) NOT NULL UNIQUE,
        file_name VARCHAR(255) NOT NULL,
        imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        matched_image_id INT NULL,
        tags_imported INT NOT NULL DEFAULT 0,
        INDEX idx_drive_id (drive_id),
        INDEX idx_imported_at (imported_at),
        FOREIGN KEY (matched_image_id) REFERENCES media_images (id) ON DELETE SET NULL
    );