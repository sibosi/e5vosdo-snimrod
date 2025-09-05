-- DROP TABLE IF EXISTS events;
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    time VARCHAR(255) NOT NULL,
    show_time DATE,
    hide_time DATE NOT NULL,
    image VARCHAR(255),
    description TEXT,
    tags JSON,
    author VARCHAR(255) NOT NULL DEFAULT '',
    show_author BOOLEAN NOT NULL DEFAULT FALSE,
    show_at_carousel BOOLEAN NOT NULL DEFAULT FALSE,
    show_at_events BOOLEAN NOT NULL DEFAULT FALSE
);
--@block
SELECT * FROM events;

--@block
DROP TABLE IF EXISTS events;
