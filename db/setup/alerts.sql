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
("Kedves Diákok! Az előadásjelentkezés az alábbi felületen történik: <a href='https://info.e5vosdo.hu/e5n' className='text-selfsecondary-700'>info.e5vosdo.hu/e5n</a> \n\n<span className='font-extrabold'>A jelentkezéshez be kell jelentkezni a jobb fenti profil megnyomásával!!!</span>", "bg-selfprimary-300 border-selfprimary-400 mx-auto text-xl", 1, 0);