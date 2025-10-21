-- Class Programs Table
CREATE TABLE
    IF NOT EXISTS class_programs (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        room VARCHAR(50) NOT NULL,
        class VARCHAR(50) NOT NULL,
        time_slot VARCHAR(100) NOT NULL DEFAULT 'Kedd 15:00-18:00',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- User Votes Table
CREATE TABLE
    IF NOT EXISTS class_program_votes (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        program_id INTEGER NOT NULL,
        vote_order INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (program_id) REFERENCES class_programs (id),
        UNIQUE KEY unique_user_program (email, program_id),
        INDEX idx_email (email)
    );

--@block
-- Insert initial program data
INSERT INTO
    class_programs (name, room, class, time_slot)
VALUES
    ('Fogadóiroda', '58', '9.N', 'Kedd 15:00-18:00'),
    ('Vitaszoba', '101', '11.E', 'Kedd 15:00-18:00'),
    ('Buliszoba', '102', '11.F', 'Kedd 15:00-18:00'),
    (
        'Karácsony szoba',
        '107',
        '7.A',
        'Kedd 15:00-18:00'
    ),
    ('Párnacsata', '108', '8.B', 'Kedd 15:00-18:00'),
    ('Jósda', '109', '8.A', 'Kedd 15:00-18:00'),
    ('Horrorház', '111', '7.B', 'Kedd 15:00-18:00'),
    ('Chillszoba', '112', '12.E', 'Kedd 15:00-18:00'),
    (
        'Legyen ön is milliomos',
        '200',
        '9.F',
        'Kedd 15:00-18:00'
    ),
    ('Workout', '201', '9.C', 'Kedd 15:00-18:00'),
    ('Teaház', '202', '11.B', 'Kedd 15:00-18:00'),
    (
        'Videojáték szoba',
        '208',
        '9.B',
        'Kedd 15:00-18:00'
    ),
    ('Karaoke', '209', '9.A', 'Kedd 15:00-18:00'),
    (
        'Alszik a város',
        '211',
        '12.F',
        'Kedd 15:00-18:00'
    ),
    ('Just Dance', '212', '12.D', 'Kedd 15:00-18:00'),
    ('Falunap', '215', '11.A', 'Kedd 15:00-18:00'),
    (
        'Nyugdíjas klub',
        '216',
        '11.D',
        'Kedd 15:00-18:00'
    ),
    ('Kahoot szoba', '217', '12.A', 'Kedd 15:00-18:00'),
    ('Festő szoba', '219', '12.C', 'Kedd 15:00-18:00'),
    ('Kocsma', '220', '9.E', 'Kedd 15:00-18:00'),
    (
        'Yoga, Zumba, Tánc',
        '221',
        '11.C',
        'Kedd 15:00-18:00'
    ),
    ('Társas szoba', '222', '12.B', 'Kedd 15:00-18:00'),
    ('Kaszinó', '223', '9.D', 'Kedd 15:00-18:00'),
    ('Zene szoba', '305', '10.D', 'Kedd 15:00-18:00'),
    ('Filmszoba', '306', '10.C', 'Kedd 15:00-18:00'),
    ('Megemlékezés', '307', '10.B', 'Kedd 15:00-18:00'),
    ('Pankráció', '308', '10.A', 'Kedd 15:00-18:00'),
    ('Konspi', '309', '10.E', 'Kedd 15:00-18:00'),
    (
        'Szabadulószoba',
        '310',
        '10.F',
        'Kedd 15:00-18:00'
    );

--@block
-- View votes
SELECT
    *
FROM
    class_program_votes
ORDER BY
    email,
    vote_order;

--@block
-- View programs with vote counts
SELECT
    p.id,
    p.name,
    p.room,
    p.class,
    COUNT(v.id) as vote_count
FROM
    class_programs p
    LEFT JOIN class_program_votes v ON p.id = v.program_id
GROUP BY
    p.id
ORDER BY
    vote_count DESC,
    p.name;

--@block
DELETE FROM class_programs;