CREATE TABLE IF NOT EXISTS parlaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date VARCHAR(255) NOT NULL,
    title VARCHAR(255) DEFAULT "Parlament"
);

CREATE TABLE IF NOT EXISTS parlament_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parlament_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    class VARCHAR(255) NOT NULL,
    FOREIGN KEY (parlament_id) REFERENCES parlaments(id)
);
