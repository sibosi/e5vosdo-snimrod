ALTER TABLE users
    ADD COLUMN IF NOT EXISTS push_about_chatwall BOOLEAN NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS chatwall_messages (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_image VARCHAR(255) NOT NULL,
    parent_id BIGINT UNSIGNED REFERENCES chatwall_messages(id) ON DELETE CASCADE,
    content TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chatwall_message_mentions (
    message_id BIGINT UNSIGNED NOT NULL,
    mentioned_user_email VARCHAR(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
    PRIMARY KEY (message_id, mentioned_user_email),
    FOREIGN KEY (message_id) REFERENCES chatwall_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (mentioned_user_email) REFERENCES users(email) ON DELETE CASCADE
);
