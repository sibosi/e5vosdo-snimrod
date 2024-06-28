CREATE TABLE IF NOT EXISTS `users` (
    `username` varchar(255) NOT NULL,
    `email` varchar(255) PRIMARY KEY NOT NULL UNIQUE,
    `image` varchar(255) NOT NULL,
    `EJG_code` varchar(255) UNIQUE,
    `class` varchar(255),
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `last_login` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `permissions` JSON NOT NULL DEFAULT '[]',
    `food_menu` CHAR(1),
    `coming_year` INT,
    `class_character` CHAR(1),
    `order_number` INT,
    CHECK (food_menu IN ('A', 'B'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
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
--@block
SELECT *
FROM users;
--@block
-- Delete all tables
DROP TABLE users;
--@block
-- Add A food menu to nimrod user
UPDATE users
SET EJG_code = '2023C25EJG462'
WHERE email = 'simon.nimrod.zalan@e5vos.hu';
--@block
-- Add permissions to nimrod user
UPDATE users
SET permissions = '["student"]'
WHERE email = 'no.one@e5vos.hu';
--@block
SELECT email,
    permissions
FROM users;
--@block
-- Add user permissions to nimrod user
UPDATE users
SET permissions = '["student", "admin"]'
WHERE email = 'simon.nimrod.zalan@e5vos.hu';
--@block
-- Append permissions to nimrod user
UPDATE users
SET permissions = JSON_ARRAY_APPEND(permissions, '$', 'tester')
WHERE email = 'simon.nimrod.zalan@e5vos.hu';
--@block
-- Remove 'admin' permission from 'simon.nimrod.zalan@e5vos.hu' user
UPDATE users
SET permissions = JSON_REMOVE(
        permissions,
        JSON_UNQUOTE(
            JSON_SEARCH(permissions, 'one', 'tester')
        )
    )
WHERE email = 'simon.nimrod.zalan@e5vos.hu';
