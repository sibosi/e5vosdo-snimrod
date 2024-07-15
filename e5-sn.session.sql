CREATE TABLE IF NOT EXISTS `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL UNIQUE,
    `image` varchar(255) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
INSERT INTO `users` (`username`, `email`, `image`)
VALUES ('JohnDoe', 'johndoes@example.com', 'profile.jpg');
--@block
SELECT *
FROM `users`;
--@block
-- Find a specific user
SELECT *
FROM `users`
WHERE `username` = 'JohnDoe';
-- If the user is not found, add it
INSERT INTO `users` (`username`, `email`, `image`)
SELECT 'JohnDoe',
    'johndoes@example.com',
    '/apa.jpg'
WHERE NOT EXISTS (
        SELECT *
        FROM `users`
        WHERE `username` = ' JohnDoe '
    );
--@block
-- Update the Joe' s name and image if his email is in the database
UPDATE `users`
SET `username` = 'JaneDoe',
    `image` = '/apa.jpg'
WHERE `email` = 'johndoes@example.com';
--@block
-- Add last login date
ALTER TABLE `users`
ADD `last_login` timestamp;
--@block
-- Add Joe' s last login date to now
UPDATE `users`
SET `last_login` = NOW()
WHERE `email` = '';
