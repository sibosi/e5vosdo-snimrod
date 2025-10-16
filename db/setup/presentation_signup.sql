CREATE TABLE IF NOT EXISTS signups (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    slot VARCHAR(255) NOT NULL,
    presentation_id INTEGER NOT NULL,
    FOREIGN KEY (presentation_id) REFERENCES presentations(id)
);
--@block
SELECT *
FROM signups;
SELECT *
FROM presentations;
--@block
DROP TABLE IF EXISTS presentations;
CREATE TABLE IF NOT EXISTS presentations (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    slot VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    performer VARCHAR(255) DEFAULT NULL,
    description TEXT NOT NULL,
    address VARCHAR(255) NOT NULL,
    requirements VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    remaining_capacity INTEGER DEFAULT NULL
);

--@block
SELECT *
FROM presentations;
--@block
UPDATE presentations
SET capacity = 15
WHERE id = 22
    AND capacity = 30;