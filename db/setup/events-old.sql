-- copy the events table to events_old
-- DROP TABLE IF EXISTS events_old;
CREATE TABLE IF NOT EXISTS events_old (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    time VARCHAR(255) NOT NULL,
    show_time DATE,
    hide_time DATE NOT NULL,
    image VARCHAR(255),
    description TEXT,
    tags JSON
);
-- INSERT INTO events_old SELECT * FROM events;
--@block
SELECT * FROM events_old;
