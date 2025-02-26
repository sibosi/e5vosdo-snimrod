DROP TABLE IF EXISTS alerts;
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    className text,
    padding BOOLEAN NOT NULL DEFAULT 0,
    icon BOOLEAN DEFAULT 0
);
INSERT INTO alerts (text, className, padding, icon)
VALUES (
        "r_edirect=https://e5vosdo.hu",
        "bg-selfprimary-300 border-selfprimary-400 mx-auto hidden",
        1,
        0
    ),
    (
        "A 8-11. évfolyamosok jelentkezési felülete: <a href='https://info.e5vosdo.hu/jelentkezes' className='text-selfsecondary-700'>info.e5vosdo.hu/jelentkezes</a>",
        "bg-selfprimary-300 border-selfprimary-400 mx-5 text-md hidden",
        1,
        NULL
    );