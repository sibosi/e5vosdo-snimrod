CREATE TABLE
    IF NOT EXISTS media_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        -- Kép készítésének időpontja (EXIF-ből kinyerve, NULL ha nem elérhető)
        datetime VARCHAR(50) DEFAULT NULL,
        -- Drive-ra feltöltés időpontja
        upload_datetime VARCHAR(50) NOT NULL,
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
        large_preview_height INT,
        media_type VARCHAR(10) DEFAULT 'image',
        video_url VARCHAR(255) NULL
    );

CREATE TABLE
    IF NOT EXISTS media_images_tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tag_name VARCHAR(100) NOT NULL,
        tag_type VARCHAR(20) NOT NULL DEFAULT 'event_main'
            CHECK (tag_type IN ('year', 'event_main', 'event_part', 'madeBy', 'person')),
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

CREATE TABLE
    IF NOT EXISTS media_images_pinned_tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tag_id INT NOT NULL,
        year_tag_id INT NOT NULL,
        event_main_tag_id INT NOT NULL,
        UNIQUE KEY unique_pinned_tag_context (tag_id, year_tag_id, event_main_tag_id),
        FOREIGN KEY (tag_id) REFERENCES media_images_tags (id) ON DELETE CASCADE,
        FOREIGN KEY (year_tag_id) REFERENCES media_images_tags (id) ON DELETE CASCADE,
        FOREIGN KEY (event_main_tag_id) REFERENCES media_images_tags (id) ON DELETE CASCADE
    );

--@block - Migration (átmenet)
--@block
ALTER TABLE media_images_tags
ADD COLUMN tag_type VARCHAR(20) NOT NULL DEFAULT 'event_main'
    CHECK (tag_type IN ('year', 'event_main', 'event_part', 'madeBy', 'person'));

-- A régi madeBy prioritású tagek megőrzése az új modellben.
UPDATE media_images_tags
SET tag_type = 'madeBy'
WHERE priority = 'madeBy';

ALTER TABLE media_images_tags
DROP COLUMN priority;

--@block
ALTER TABLE media_images
ADD COLUMN media_type VARCHAR(10) DEFAULT 'image',
ADD COLUMN video_url VARCHAR(255) NULL;
