DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS `users` (
    `name` varchar(255) NOT NULL,
    `username` varchar(255) NOT NULL,
    `email` varchar(255) PRIMARY KEY NOT NULL UNIQUE,
    `image` varchar(255) NOT NULL,
    `EJG_code` varchar(255) UNIQUE,
    `class` varchar(255),
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_login` varchar(255) NOT NULL,
    `permissions` JSON NOT NULL,
    `food_menu` CHAR(1),
    `coming_year` INT,
    `class_character` CHAR(1),
    `order_number` INT,
    CHECK (food_menu IN ('A', 'B')),
    `notifications` JSON NOT NULL,
    `service_workers` JSON NOT NULL,
    `nickname` VARCHAR(255) NOT NULL,
    `tickets` JSON NOT NULL,
    `hidden_lessons` JSON NOT NULL,
    `default_group` INT
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
-- Add triggers to the users table
CREATE TRIGGER before_insert_users BEFORE
INSERT ON users FOR EACH ROW BEGIN
SET NEW.coming_year = SUBSTRING(NEW.EJG_code, 1, 4);
SET NEW.class_character = SUBSTRING(NEW.EJG_code, 5, 1);
SET NEW.order_number = SUBSTRING(NEW.EJG_code, 6, 2);
END;
CREATE TRIGGER before_update_users BEFORE
UPDATE ON users FOR EACH ROW BEGIN
SET NEW.coming_year = SUBSTRING(NEW.EJG_code, 1, 4);
SET NEW.class_character = SUBSTRING(NEW.EJG_code, 5, 1);
SET NEW.order_number = SUBSTRING(NEW.EJG_code, 6, 2);
END;
DROP TABLE IF EXISTS events;
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    time VARCHAR(255) NOT NULL,
    show_time DATE,
    hide_time DATE NOT NULL,
    image VARCHAR(255),
    details TEXT,
    tags JSON
);
-- Add notifications table
DROP TABLE IF EXISTS notifications;
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    time VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    receiving_emails JSON NOT NULL
);
INSERT INTO notifications (
        title,
        message,
        time,
        sender_email,
        receiving_emails
    )
VALUES (
        'Gratuláció!',
        'Sikeresen regisztráltál az E5VOS rendszerébe! Jó szórakozást! Üdvözlettel: Nimród, az E5VOS DÖ oldal rendszergazdája.',
        '2024/09/01 12:00:00Z',
        'simon.nimrod.zalan@e5vos.hu',
        '[]'
    );
DROP TABLE IF EXISTS push_auths;
CREATE TABLE IF NOT EXISTS push_auths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auth VARCHAR(255) NOT NULL
);
-- Add the settings table
-- First delete the old settings table
DROP TABLE IF EXISTS settings;
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    headspace boolean NOT NULL,
    livescore INT NOT NULL
);
-- Add settings
INSERT INTO settings (name, headspace, livescore)
VALUES ("default", 0, 0);
INSERT INTO settings (name, headspace, livescore)
VALUES ('soccer', 1, 1);
INSERT INTO settings (name, headspace, livescore)
VALUES ('now', 0, 0);
-- Add the matches table
DROP TABLE IF EXISTS matches;
CREATE TABLE IF NOT EXISTS matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    team1 VARCHAR(255) NOT NULL,
    team2 VARCHAR(255) NOT NULL,
    team_short1 VARCHAR(255) NOT NULL,
    team_short2 VARCHAR(255) NOT NULL,
    score1 INT NOT NULL,
    score2 INT NOT NULL,
    image1 VARCHAR(255),
    image2 VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    time VARCHAR(255) NOT NULL,
    start_time VARCHAR(255) NOT NULL,
    end_time VARCHAR(255) NOT NULL
);
INSERT INTO matches (
        url,
        team1,
        team2,
        team_short1,
        team_short2,
        score1,
        score2,
        image1,
        image2,
        status,
        time,
        start_time,
        end_time
    )
VALUES (
        "https://www.livescore.cz/match/IFsEWU3F",
        "",
        "",
        "",
        "",
        0,
        0,
        NULL,
        NULL,
        "Finished",
        "2021-10-24 20:00:00",
        "2021-10-24 20:00:00",
        "2021-10-24 22:00:00"
    );
-- Add logs table
DROP TABLE IF EXISTS logs;
CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    time VARCHAR(255) NOT NULL,
    user VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    message TEXT
);
