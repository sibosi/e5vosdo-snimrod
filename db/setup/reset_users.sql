-- DROP TABLE IF EXISTS `users`;
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
    `push_permission` BOOLEAN NOT NULL DEFAULT 0,
    `push_about_games` BOOLEAN NOT NULL DEFAULT 0,
    `push_about_timetable` BOOLEAN NOT NULL DEFAULT 0,
    `OM5` VARCHAR(5),
    `need_import` BOOLEAN DEFAULT FALSE
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
