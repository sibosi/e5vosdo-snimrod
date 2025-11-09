DROP TABLE IF EXISTS alerts;

CREATE TABLE
    IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        text TEXT NOT NULL,
        className text,
        padding BOOLEAN NOT NULL DEFAULT 0,
        icon BOOLEAN DEFAULT 0
    );

INSERT INTO
    alerts (text, className, padding, icon)
VALUES
    --    (
    --        "TSX",
    --        "hidden/not",
    --        1,
    --        NULL
    --    ),
    (
        "Kedves Diákok! A jelentkezési felület holnap HiSchool program után, a délután folyamán nyílik meg.",
        "hidden",
        1,
        NULL
    ),
    (
        "Legfeljebb 2 órára lehet jelentkezni.",
        "hidden",
        1,
        NULL
    );