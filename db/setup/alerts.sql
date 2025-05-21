DROP TABLE IF EXISTS alerts;
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    className text,
    padding BOOLEAN NOT NULL DEFAULT 0,
    icon BOOLEAN DEFAULT 0
);
INSERT INTO alerts (text, className, padding, icon)
VALUES
    (
        "<a href='https://docs.google.com/spreadsheets/d/1097V-LMPhvk4vhOe8B_zUEp2Fpf7mtGs' className='text-selfprimary-700'>Az aktuális teremcseréket itt találod.</a>",
        "bg-selfprimary-100 border-selfprimary-300 mx-5 text-md",
        1,
        NULL
    );