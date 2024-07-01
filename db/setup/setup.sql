CREATE TABLE IF NOT EXISTS `users` (
    `name` varchar(255) NOT NULL,
    `username` varchar(255) NOT NULL,
    `email` varchar(255) PRIMARY KEY NOT NULL UNIQUE,
    `image` varchar(255) NOT NULL,
    `EJG_code` varchar(255) UNIQUE,
    `class` varchar(255),
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_login` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `permissions` JSON NOT NULL,
    `food_menu` CHAR(1),
    `coming_year` INT,
    `class_character` CHAR(1),
    `order_number` INT,
    CHECK (food_menu IN ('A', 'B')),
    `notifications` JSON NOT NULL,
    `service_workers` JSON NOT NULL,
    `push_auth` JSON NOT NULL
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
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sender_email VARCHAR(255) NOT NULL,
    receiving_emails JSON NOT NULL
);
--@block
CREATE TABLE IF NOT EXISTS push_auths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auth VARCHAR(255) NOT NULL
);
--@block
SELECT *
FROM push_auths;
