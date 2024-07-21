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
WHERE email = 'illes.gergo@e5vos.hu';
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
SET permissions = JSON_ARRAY_APPEND(permissions, '$', 'admin')
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
--@block
-- Add name col. and set name to username
ALTER TABLE users
ADD COLUMN name VARCHAR(255) NOT NULL;
UPDATE users
SET name = username;
--@block
-- Remove permissions colunm
ALTER TABLE users DROP COLUMN permissions;
--@block
-- Add permissions colunm
ALTER TABLE users
ADD COLUMN permissions JSON NOT NULL;
--@block
SELECT *
FROM events;
--@block
UPDATE users
SET permissions = '[]';
--@block
-- Add notifications col to the users
ALTER TABLE users
ADD COLUMN notifications JSON NOT NULL;
--@block
-- Add notifications to the table
INSERT INTO notifications (title, message, sender_email, receiving_emails)
VALUES (
        'Gratuláció!',
        'Sikeresen regisztráltál az E5VOS rendszerébe! Jó szórakozást! Üdvözlettel: Nimród, az E5VOS DÖ oldal rendszergazdája.',
        'simon.nimrod.zalan@e5vos.hu',
        '["simon.nimrod.zalan@e5vos.hu", "no.one@e5vos.hu"]'
    );
SET @notification_id = LAST_INSERT_ID();
-- Add notifications to the user
UPDATE users
    JOIN (
        SELECT receiving_emails
        FROM notifications
        WHERE id = @notification_id
    ) AS n ON JSON_CONTAINS(n.receiving_emails, JSON_QUOTE(users.email), '$')
SET users.notifications = JSON_ARRAY_APPEND(
        users.notifications,
        '$',
        CAST(@notification_id AS JSON)
    );
--@block
SELECT *
FROM users;
--@block
SELECT *
FROM notifications;
--@block
-- set nimrod's notifications to empty array
UPDATE users
SET notifications = '[3, 4, 5, 6]'
WHERE email = 'simon.nimrod.zalan@e5vos.hu';
--@block
INSERT INTO notifications (title, message, sender_email, receiving_emails)
VALUES (
        'Hello5',
        'hello5',
        'simon.nimrod.zalan@e5vos.hu',
        '["simon.nimrod.zalan@e5vos.hu"]'
    );
SET @notification_id = LAST_INSERT_ID();
UPDATE users
    JOIN (
        SELECT receiving_emails
        FROM notifications
        WHERE id = @notification_id
    ) AS n ON JSON_CONTAINS(n.receiving_emails, JSON_QUOTE(users.email), '$')
SET users.notifications = JSON_ARRAY_APPEND(
        users.notifications,
        '$',
        CAST(@notification_id AS JSON)
    );
--@block
-- Update the notifications to [] from NULL
UPDATE users
SET notifications = '[3]';
--@block
SELECT *
FROM users;
--@block
UPDATE users
SET service_workers = '[]'
WHERE email = 'simon.nimrod.zalan@e5vos.hu';
--@block
UPDATE users
SET service_workers = JSON_ARRAY_APPEND(
        service_workers,
        '$',
        JSON_OBJECT(
            'endpoint',
            'str',
            'expirationTime',
            NULL,
            'keys',
            JSON_OBJECT(
                'p256dh',
                'str',
                'auth',
                'str'
            )
        )
    )
WHERE email = 'simon.nimrod.zalan@e5vos.hu';
--@block
UPDATE users
SET service_workers = '[]'
WHERE service_workers IS NULL;
--@block
UPDATE push_auths
SET auth = NULL;
--@block
SELECT *
FROM push_auths;
--@block
SELECT *
FROM notifications;
--@block
UPDATE users
Set notifications = '{ "new": [1, 109], "read": [], "sent": []  }';
--@block
UPDATE users
SET notifications = JSON_SET(
        notifications,
        '$.new',
        JSON_ARRAY(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
    )
WHERE email = 'simon.nimrod.zalan@e5vos.hu';
--@block
SELECT *
FROM users
WHERE email = 'simon.nimrod.zalan@e5vos.hu';
--@block
-- Create nickname column
ALTER TABLE users
ADD COLUMN nickname VARCHAR(255) NOT NULL;
--@block
-- Set nickname to names first part
UPDATE users
SET nickname = SUBSTRING_INDEX(name, ' ', 1);
--@block
-- Add tickets column
ALTER TABLE users
ADD COLUMN tickets JSON NOT NULL;
--@block
-- Add tickets to the user
UPDATE users
SET tickets = '["EJG_code_edit", "EJG_code_edit"]'
WHERE email = 'simon.nimrod.zalan@e5vos.hu';
--@block
-- Delete Nimrod user
DELETE FROM users
WHERE email = 'simon.nimrod.zalan@e5vos.hu';
--@block
-- Append "user" permissions to every user
UPDATE users
SET permissions = JSON_ARRAY_APPEND(
        permissions,
        '$',
        'user'
    );
--@block
SELECT *
FROM matches;
--@block
-- Reset notifications
DROP TABLE notifications;
CREATE TABLE notifications (
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
        sender_email,
        receiving_emails,
        time
    )
VALUES (
        'Gratuláció!',
        'Sikeresen regisztráltál az E5VOS rendszerébe! Jó szórakozást! Üdvözlettel: Nimród, az E5VOS DÖ oldal rendszergazdája.',
        'simon.nimrod.zalan@e5vos.hu',
        '[]',
        '2024/09/01 00:00 '
    );
SET @notification_id = LAST_INSERT_ID();
UPDATE users
SET notifications = '{ "new": [1], "read": [], "sent": []  }';
--@block
SELECT *
FROM notifications;
SELECT *
FROM users;
--@block
-- Reset last_login column to STRING
ALTER TABLE users
MODIFY COLUMN last_login VARCHAR(255) NOT NULL;
--@block
SELECT *
FROM timetable;
