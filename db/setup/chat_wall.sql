CREATE TABLE IF NOT EXISTS chatwall_messages (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_image VARCHAR(255) NOT NULL,
    parent_id INT REFERENCES chatwall_messages(id) ON DELETE CASCADE,
    content TEXT NOT NULL
);
