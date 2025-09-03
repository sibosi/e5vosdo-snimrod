CREATE TABLE IF NOT EXISTS media_images (
    datetime VARCHAR(50) NOT NULL,
    original_drive_id VARCHAR(255) NOT NULL UNIQUE KEY,
    original_file_name VARCHAR(255),
    color VARCHAR(50),
    compressed_drive_id VARCHAR(255) NOT NULL UNIQUE,
    compressed_file_name VARCHAR(255),
    compressed_width INT,
    compressed_height INT
);

--@block
SELECT * FROM media_images;

--@block
-- delete all
DELETE FROM media_images;

