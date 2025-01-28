DROP TABLE IF EXISTS events_preview;
CREATE TABLE IF NOT EXISTS events_preview (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    time VARCHAR(255) NOT NULL,
    show_time DATE,
    hide_time DATE NOT NULL,
    image VARCHAR(255),
    description TEXT,
    tags JSON
);
--@block
SELECT * FROM events_preview;
