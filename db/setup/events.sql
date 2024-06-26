DROP TABLE IF EXISTS events;
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    time VARCHAR(255) NOT NULL,
    show_time DATE,
    hide_time DATE NOT NULL,
    image VARCHAR(255),
    details TEXT,
    tags JSON
);
INSERT INTO events (
        title,
        time,
        show_time,
        hide_time,
        image,
        details,
        tags
    )
VALUES (
        'Példa esemény',
        'május 20. 17:43',
        '2024-04-02',
        '2025-05-21',
        NULL,
        NULL,
        '["9. évf", "7.A"]'
    ),
    (
        'Dzsungel könyve előadások',
        'május 27./30. 18:00',
        '2024-04-02',
        '2025-05-31',
        '/events/junglebook.jpg',
        'A Színjátszó szakkör egyhetes előadássorozata, mely a Dzsungel könyvét hozza színpadra. Jegyek vásárlása a büfénél.',
        '["előadás"]'
    ),
    (
        'Pedagógus nap',
        'május 31.',
        '2024-04-02',
        '2025-05-02',
        '/events/pedagogusnap.png',
        NULL,
        '[]'
    ),
    (
        'Eötvös/Apáczai röplabda bajnokság',
        'június 14. 16:00',
        NULL,
        '2025-06-15',
        '/events/ropi2.jpg',
        'Időpont: június 14. (péntek) 16:00 \n Helyszín: Eötvös nagy tornaterem \n\n Jelentkezni 4+1 fős csapatoknak lehet.\nMindkét iskolából 4/4 csapatra számítunk, túljelentkezés esetén az iskola megszavazza, hogy mely csapatok induljanak.',
        '["sport", "E5vos x Apáczai"]'
    ),
    (
        'Tremoloes koncert',
        'június 14. 19:00',
        NULL,
        '2025-06-15',
        '/events/koncert.jpg',
        'Június 14-én szeretettel várunk mindenkit a Tremoloes 1 éves jubileumi koncertjén 19:00-tól a díszteremben! Családtagokat, külsős barátokat bátran hozzatok magatokkal! \n\n Szeretettel vár a Tremoloes',
        '["koncert"]'
    ),
    (
        'Kertmozi: Kék Pelikán',
        'június 17. - Hétfő',
        NULL,
        '2025-06-18',
        '/events/kekpelikan.jpg',
        'Időpont: június 17. (Hétfő) 20:00 - 23:00 \n Helyszín: Eötvös udvara\nFilm: Kék Pelikán \nmoderátor: Ott Anna (irodalmár) \n\n A film alatt büfé is áll a rendelkezésetekre. Várunk Titeket szeretettel! <a href="https://port.hu/adatlap/film/mozi/kek-pelikan-kek-pelikan/movie-227896" className="fill-blue-500">További információ a filmről</a>',
        '["filmezés"]'
    ),
    (
        'Kertmozi: Semmelweis',
        'június 18. - Kedd',
        NULL,
        '2025-06-19',
        '/events/semmelweis.jpeg',
        'Időpont: június 18. (Kedd) 20:00 - 23:00 \n Helyszín: Eötvös udvara\nFilm: Semmelweis \nmoderátor: Hargitai Petra (korábbi DÖ elnök) \n\n A film alatt büfé is áll a rendelkezésetekre. Várunk Titeket szeretettel! <a href="https://port.hu/adatlap/film/mozi/semmelweis-semmelweis/movie-249788" className="fill-blue-500">További információ a filmről</a>',
        '["filmezés"]'
    ),
    (
        'Kertmozi: Hadik',
        'június 19. - Szerda.',
        NULL,
        '2025-06-20',
        '/events/hadik.jpg',
        'Időpont: június 18. (Kedd) 20:00 - 23:00 \n Helyszín: Eötvös udvara\nFilm: Hadik \nmoderátor: Bosznai Tibor (Hadik étterem és kávéház tulajdonosa és ügyvezetője) \n\n A film alatt büfé is áll a rendelkezésetekre. Várunk Titeket szeretettel! <a href="https://port.hu/adatlap/film/mozi/hadik-hadik/movie-244512" className="fill-blue-500">További információ a filmről</a>',
        '["filmezés"]'
    ),
    (
        'Tanévzáró ünnepség',
        'június 21.',
        '2024-06-02',
        '2025-06-22',
        '/events/evnyito.jpg',
        NULL,
        '[]'
    );
--@block
SELECT *
FROM events;
