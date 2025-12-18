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

CREATE TABLE
    IF NOT EXISTS media_images_tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tag_name VARCHAR(100) NOT NULL,
        UNIQUE KEY unique_tag_name (tag_name)
    );

CREATE TABLE
    IF NOT EXISTS media_images_to_tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        media_image_id INT NOT NULL,
        media_image_tag_id INT NOT NULL,
        coordinate1_x INT DEFAULT NULL,
        coordinate1_y INT DEFAULT NULL,
        coordinate2_x INT DEFAULT NULL,
        coordinate2_y INT DEFAULT NULL,
        UNIQUE KEY unique_media_image_tag (media_image_id, media_image_tag_id),
        FOREIGN KEY (media_image_id) REFERENCES media_images (id) ON DELETE CASCADE,
        FOREIGN KEY (media_image_tag_id) REFERENCES media_images_tags (id) ON DELETE CASCADE
    );

--@block - Migration (átmenet)
--@block
SELECT
    *
FROM
    media_images;

--@block
-- delete all