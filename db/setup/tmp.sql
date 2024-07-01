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
SET service_workers = '[]';
