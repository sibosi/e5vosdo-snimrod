CREATE TABLE IF NOT EXISTS presentations (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    organiser VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    remaining_capacity INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS signups (
    email VARCHAR(255) NOT NULL PRIMARY KEY,
    presentation_id INTEGER NOT NULL,
    FOREIGN KEY (presentation_id) REFERENCES presentations(id)
);
--@block
-- create test data
INSERT INTO presentations (
        name,
        organiser,
        description,
        capacity,
        remaining_capacity
    )
VALUES (
        'Presentation 1',
        'Organiser 1',
        'Description 1',
        10,
        10
    ),
    (
        'Presentation 2',
        'Organiser 2',
        'Description 2',
        20,
        20
    ),
    (
        'Presentation 3',
        'Organiser 3',
        'Description 3',
        30,
        30
    );