DROP TABLE IF EXISTS events_active;
CREATE TABLE IF NOT EXISTS events_active (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    time VARCHAR(255) NOT NULL,
    show_time VARCHAR(255) NOT NULL,
    hide_time VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    description TEXT,
    tags JSON
);
--@block
SELECT * FROM events_active;
