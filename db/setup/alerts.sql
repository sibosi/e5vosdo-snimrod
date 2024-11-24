DROP TABLE IF EXISTS alerts;
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    className text,
    padding BOOLEAN NOT NULL DEFAULT 0,
    icon BOOLEAN NOT NULL DEFAULT 0
);
INSERT INTO alerts (text, className, padding, icon)
VALUES 
("r_edirect=https://e5vosdo.hu", "bg-selfprimary-300 border-selfprimary-400 mx-auto hidden", 1, 0),
("<a href='https://docs.google.com/spreadsheets/d/1_-GniTd1e6O1rpxLq3qCz1g2YUijh8Z1Lt_ejF8Y6nY/edit?gid=128007900#gid=128007900' className='text-selfsecondary-700'>Aktuális teremcserék itt</a>", "bg-selfprimary-300 border-selfprimary-400 mx-auto text-md", 1, 0),
("Saját előadások megtekintése: <a href='https://info.e5vosdo.hu/e5n' className='text-selfsecondary-700'>info.e5vosdo.hu/e5n</a>", "bg-selfprimary-300 border-selfprimary-400 mx-auto text-xl hidden", 1, 0);