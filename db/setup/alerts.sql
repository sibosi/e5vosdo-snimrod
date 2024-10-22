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
("Kedves Diákok!\nAz előadásjelentkezés 11:15-kor nyílik meg az <a href='https://e5vosdo.hu' className='text-selfsecondary-700'>e5vosdo.hu</a> oldalon.", "hidden bg-selfprimary-300 border-selfprimary-400 mx-auto text-xl", 1, 0);