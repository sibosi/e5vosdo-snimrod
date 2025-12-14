CREATE TABLE
    IF NOT EXISTS media_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        datetime VARCHAR(50) NOT NULL,
        original_drive_id VARCHAR(255) NOT NULL UNIQUE KEY,
        original_file_name VARCHAR(255),
        color VARCHAR(50),
        -- Kis preview (thumbnail) ~200px magasság
        small_preview_drive_id VARCHAR(255),
        small_preview_width INT,
        small_preview_height INT,
        -- Nagy preview (modal) ~1200px szélesség
        large_preview_drive_id VARCHAR(255),
        large_preview_width INT,
        large_preview_height INT
    );

--@block - Migration (átmenet)
--@block
SELECT
    *
FROM
    media_images;

--@block
-- delete all
DELETE FROM media_images;