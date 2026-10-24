CREATE TABLE
    IF NOT EXISTS presentation_slots (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        details VARCHAR(255) DEFAULT NULL
    );

CREATE TABLE
    IF NOT EXISTS presentations (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        slot_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        performer VARCHAR(255) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        address VARCHAR(255),
        requirements VARCHAR(255) DEFAULT NULL,
        capacity INTEGER NOT NULL,
        remaining_capacity INTEGER DEFAULT NULL,
        open_for ENUM('everyone', 'only_priority', 'nobody') NOT NULL DEFAULT 'nobody',
        linked_presentation_id INTEGER DEFAULT NULL,
        INDEX idx_presentations_linked_presentation_id (linked_presentation_id),
        FOREIGN KEY (slot_id) REFERENCES presentation_slots (id)
    );

CREATE TABLE
    IF NOT EXISTS signups (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        slot_id INTEGER NOT NULL,
        presentation_id INTEGER NOT NULL,
        participated BOOLEAN DEFAULT FALSE NOT NULL,
        amount INTEGER DEFAULT 1 NOT NULL,
        details TEXT DEFAULT NULL,
        UNIQUE KEY uq_signups_email_slot (email, slot_id),
        FOREIGN KEY (presentation_id) REFERENCES presentations (id),
        FOREIGN KEY (slot_id) REFERENCES presentation_slots (id)
    );

--@block
SELECT
    *
FROM
    presentation_slots;

SELECT
    *
FROM
    presentations;

SELECT
    *
FROM
    signups;
