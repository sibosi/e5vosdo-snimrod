--@block
SELECT
  *
FROM
  team_categories;

SELECT
  *
FROM
  teams;

SELECT
  *
FROM
  matches;

--@block
CREATE TABLE
  IF NOT EXISTS team_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(255) NOT NULL,
    color_code VARCHAR(255) NOT NULL
  );

INSERT INTO
  team_categories (name, short_name, color_code) -- Pl.: ('Röplabda', 'Röpi', 'primary'),
VALUES
  ('Foci', 'Foci', 'foreground');

CREATE TABLE
  IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    team_leader VARCHAR(255),
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES team_categories (id)
  );

-- Albánia, Bulgária, Ciprus, Csehország, Dánia, Franciaország, Görögország, Hollandia, Horvátország, Lengyelország, Magyarország, Németország, Olaszország, Portugália, Románia, Spanyolország, Svédország, Szlovákia, Szlovénia
INSERT INTO
  teams (name, category_id, image_url, team_leader)
VALUES
  ('Albánia', 1, "/flags/1x1/al.svg", 'Benkő Zétény'),
  (
    'Bulgária',
    1,
    "/flags/1x1/bg.svg",
    'Balogh Gergely'
  ),
  (
    'Ciprus',
    1,
    "/flags/1x1/cy.svg",
    'Hoklics Benedek'
  ),
  (
    'Csehország',
    1,
    "/flags/1x1/cz.svg",
    'Szilágyi Dániel Áron'
  ),
  ('Dánia', 1, "/flags/1x1/dk.svg", 'Hunya Ákos'),
  (
    'Franciaország',
    1,
    "/flags/1x1/fr.svg",
    'Okolicsányi Huba'
  ),
  (
    'Görögország',
    1,
    "/flags/1x1/gr.svg",
    'Lefánti Bálint'
  ),
  (
    'Hollandia',
    1,
    "/flags/1x1/nl.svg",
    'Terényi András'
  ),
  (
    'Horvátország',
    1,
    "/flags/1x1/hr.svg",
    'Mauritz Ádám'
  ),
  (
    'Lengyelország',
    1,
    "/flags/1x1/pl.svg",
    'Bognár István Ádám'
  ),
  (
    'Magyarország',
    1,
    "/flags/1x1/hu.svg",
    'Csajági Áron Boldizsár'
  ),
  (
    'Németország',
    1,
    "/flags/1x1/de.svg",
    'Trautzsch Hannah Elly'
  ),
  (
    'Olaszország',
    1,
    "/flags/1x1/it.svg",
    'Oláh Zoltán'
  ),
  (
    'Portugália',
    1,
    "/flags/1x1/pt.svg",
    'Gayerhosz Kristóf'
  ),
  (
    'Románia',
    1,
    "/flags/1x1/ro.svg",
    'Horváth-Cziczka Nándor'
  ),
  (
    'Spanyolország',
    1,
    "/flags/1x1/es.svg",
    'Medveczky Márk'
  ),
  (
    'Svédország',
    1,
    "/flags/1x1/se.svg",
    'Jusztin Roland'
  ),
  (
    'Szlovákia',
    1,
    "/flags/1x1/sk.svg",
    'Vörös Dániel'
  ),
  (
    'Szlovénia',
    1,
    "/flags/1x1/si.svg",
    'Molnár Zétény'
  );

CREATE TABLE
  IF NOT EXISTS matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    team1_id INT NOT NULL,
    team2_id INT NOT NULL,
    team1_score INT NOT NULL DEFAULT 0,
    team2_score INT NOT NULL DEFAULT 0,
    datetime VARCHAR(255),
    start_time VARCHAR(255),
    end_time VARCHAR(255),
    status VARCHAR(255) DEFAULT 'pending',
    FOREIGN KEY (team1_id) REFERENCES teams (id),
    FOREIGN KEY (team2_id) REFERENCES teams (id)
  );

INSERT INTO
  matches (
    category_id,
    team1_id,
    team2_id,
    datetime,
    start_time,
    end_time
  )
VALUES
  (1, 8, 13, '2026-05-29T18:00:00', '', ''),
  (1, 11, 10, '2026-05-29T18:10:00', '', ''),
  (1, 9, 10, '2026-05-29T18:20:00', '', ''),
  (1, 15, 3, '2026-05-29T18:30:00', '', ''),
  (1, 7, 14, '2026-05-29T18:40:00', '', ''),
  (1, 3, 10, '2026-05-29T18:50:00', '', ''),
  (1, 13, 10, '2026-05-29T19:00:00', '', ''),
  (1, 6, 19, '2026-05-29T19:10:00', '', ''),
  (1, 15, 10, '2026-05-29T19:20:00', '', ''),
  (1, 8, 10, '2026-05-29T19:30:00', '', ''),
  (1, 16, 5, '2026-05-29T19:40:00', '', ''),
  (1, 8, 4, '2026-05-29T19:50:00', '', ''),
  (1, 6, 11, '2026-05-29T20:00:00', '', ''),
  (1, 9, 15, '2026-05-29T20:10:00', '', ''),
  (1, 2, 4, '2026-05-29T20:20:00', '', ''),
  (1, 13, 19, '2026-05-29T20:30:00', '', ''),
  (1, 12, 17, '2026-05-29T20:40:00', '', ''),
  (1, 2, 5, '2026-05-29T20:50:00', '', ''),
  (1, 1, 10, '2026-05-29T21:00:00', '', ''),
  (1, 3, 16, '2026-05-29T21:10:00', '', ''),
  (1, 6, 10, '2026-05-29T21:20:00', '', ''),
  (1, 3, 8, '2026-05-29T21:30:00', '', ''),
  (1, 1, 12, '2026-05-29T21:40:00', '', ''),
  (1, 11, 9, '2026-05-29T21:50:00', '', ''),
  (1, 2, 17, '2026-05-29T22:00:00', '', ''),
  (1, 4, 16, '2026-05-29T22:10:00', '', ''),
  (1, 19, 7, '2026-05-29T22:20:00', '', ''),
  (1, 5, 12, '2026-05-29T22:30:00', '', ''),
  (1, 2, 16, '2026-05-29T22:40:00', '', ''),
  (1, 4, 5, '2026-05-29T22:50:00', '', ''),
  (1, 6, 9, '2026-05-29T23:00:00', '', ''),
  (1, 11, 15, '2026-05-29T23:10:00', '', ''),
  (1, 3, 13, '2026-05-29T23:20:00', '', ''),
  (1, 19, 8, '2026-05-29T23:30:00', '', ''),
  (1, 7, 18, '2026-05-29T23:40:00', '', ''),
  (1, 14, 17, '2026-05-29T23:50:00', '', ''),
  (1, 1, 5, '2026-05-30T00:00:00', '', ''),
  (1, 14, 16, '2026-05-30T00:10:00', '', ''),
  (1, 11, 3, '2026-05-30T00:20:00', '', ''),
  (1, 9, 8, '2026-05-30T00:30:00', '', ''),
  (1, 15, 13, '2026-05-30T00:40:00', '', ''),
  (1, 13, 18, '2026-05-30T00:50:00', '', ''),
  (1, 17, 18, '2026-05-30T01:00:00', '', ''),
  (1, 1, 3, '2026-05-30T01:10:00', '', ''),
  (1, 8, 12, '2026-05-30T01:20:00', '', ''),
  (1, 17, 16, '2026-05-30T01:30:00', '', ''),
  (1, 11, 15, '2026-05-30T01:40:00', '', ''),
  (1, 9, 13, '2026-05-30T01:50:00', '', ''),
  (1, 6, 1, '2026-05-30T02:00:00', '', ''),
  (1, 18, 4, '2026-05-30T02:10:00', '', ''),
  (1, 7, 17, '2026-05-30T02:20:00', '', ''),
  (1, 14, 2, '2026-05-30T02:30:00', '', ''),
  (1, 18, 16, '2026-05-30T02:40:00', '', ''),
  (1, 11, 12, '2026-05-30T02:50:00', '', ''),
  (1, 6, 19, '2026-05-30T03:00:00', '', ''),
  (1, 9, 7, '2026-05-30T03:10:00', '', ''),
  (1, 15, 1, '2026-05-30T03:20:00', '', ''),
  (1, 14, 4, '2026-05-30T03:30:00', '', ''),
  (1, 2, 12, '2026-05-30T03:40:00', '', ''),
  (1, 14, 18, '2026-05-30T03:50:00', '', ''),
  (1, 4, 19, '2026-05-30T04:00:00', '', ''),
  (1, 1, 7, '2026-05-30T04:10:00', '', ''),
  (1, 6, 12, '2026-05-30T04:20:00', '', ''),
  (1, 7, 2, '2026-05-30T04:30:00', '', ''),
  (1, 5, 17, '2026-05-30T04:40:00', '', ''),
  (1, 5, 18, '2026-05-30T04:50:00', '', ''),
  (1, 14, 19, '2026-05-30T05:00:00', '', '');

--@block
UPDATE teams
SET
  name = CASE
    WHEN id = 1 THEN 'Albánia' -- Albánia - Micceretnel
    WHEN id = 2 THEN 'Bulgária' -- Bulgária - King Gellért
    WHEN id = 3 THEN 'Ciprus' -- Ciprus - Ciprus FC
    WHEN id = 4 THEN 'Csehország' -- Csehország - Ásók
    WHEN id = 5 THEN 'Dánia' -- Dánia - Aviátor Gladiátorok
    WHEN id = 6 THEN 'Franciaország' -- Franciaország - Kárpátaljai brazilok
    WHEN id = 7 THEN 'Görögország' -- Görögország - godry
    WHEN id = 8 THEN 'Hollandia' -- Hollandia - Erik a Verőember
    WHEN id = 9 THEN 'Horvátország' -- Horvátország - Tsapat
    WHEN id = 10 THEN 'Lengyelország' -- Lengyelország - La Masia FC
    WHEN id = 11 THEN 'Magyarország' -- Magyarország - Sumi
    WHEN id = 12 THEN 'Németország' -- Németország - Baranyai beton hátvédei
    WHEN id = 13 THEN 'Olaszország' -- Olaszország - Favágók
    WHEN id = 14 THEN 'Portugália' -- Portugália - 11.C
    WHEN id = 15 THEN 'Románia' -- Románia - Tarhaló gibbonok
    WHEN id = 16 THEN 'Spanyolország' -- Spanyolország - Sztróker FC
    WHEN id = 17 THEN 'Svédország' -- Svédország - Horti Gábor Katonái
    WHEN id = 18 THEN 'Szlovákia' -- Szlovákia - Vodkacsák SE
    WHEN id = 19 THEN 'Szlovénia' -- Szlovénia - Duzmi
    ELSE name
  END;
