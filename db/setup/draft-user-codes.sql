CREATE TABLE IF NOT EXISTS draft_user_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    full_name VARCHAR(255),
    EJG_code CHAR(13),
    OM CHAR(11) NOT NULL, -- F.e. "XXXXXX12345"
    OM5 CHAR(5) GENERATED ALWAYS AS (SUBSTRING(OM, 7, 5)) STORED,
    is_used BOOLEAN NOT NULL DEFAULT 0
) ENGINE = InnoDB DEFAULT CHARSET = utf8;

--@block
-- Show the emails that appears un the draft_user_codes table but not in the users table
SELECT duc.email
FROM draft_user_codes duc
LEFT JOIN users u ON duc.email = u.email
WHERE u.email IS NULL;

--@block
-- Show the emails that appears un the users table but not in the draft_user_codes table
SELECT u.email, u.EJG_code
FROM users u
LEFT JOIN draft_user_codes duc ON u.email = duc.email
WHERE duc.email IS NULL;

--@block
SELECT * FROM users;
SELECT * FROM draft_user_codes;
UPDATE users SET is_verified = 0;