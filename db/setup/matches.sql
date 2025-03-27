DROP TABLE IF EXISTS teams;
CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(255),
  team_leader VARCHAR(255),
  group_letter VARCHAR(1) NOT NULL
);

-- CREATE TRIGGER set_default_image_url
-- BEFORE INSERT ON teams
-- FOR EACH ROW
-- BEGIN
--   IF NEW.image_url IS NULL OR NEW.image_url = '' THEN
--     SET NEW.image_url = CONCAT('/teams/', NEW.name, '.png');
--   END IF;
-- END;

INSERT INTO teams (name, image_url, team_leader, group_letter) VALUES 
('Hollandia', 'https://kapowaz.github.io/square-flags/flags/nl.svg', 'Barabás Iván', 'A'),
('Franciaország', 'https://kapowaz.github.io/square-flags/flags/fr.svg', 'Lefánti Bálint', 'A'),
('Csehország', 'https://kapowaz.github.io/square-flags/flags/cz.svg', 'Varga Péter Kristóf', 'A'),
('Olaszország', 'https://kapowaz.github.io/square-flags/flags/it.svg', 'Stefkó Máté', 'A'),
('Románia', 'https://kapowaz.github.io/square-flags/flags/ro.svg', 'Gágyor Zille', 'A'),

('Magyarország', 'https://kapowaz.github.io/square-flags/flags/hu.svg', 'Kovács Miklós', 'B'),
('Ausztria', 'https://kapowaz.github.io/square-flags/flags/at.svg', 'Kristóf Huba', 'B'),
('Görögország', 'https://kapowaz.github.io/square-flags/flags/gr.svg', 'Bozsó Bodony', 'B'),
('Szlovákia', 'https://kapowaz.github.io/square-flags/flags/sk.svg', 'Liu Chenyu', 'B'),

('Bulgária', 'https://kapowaz.github.io/square-flags/flags/bg.svg', 'Muszev Nikola', 'C'),
('Németország', 'https://kapowaz.github.io/square-flags/flags/de.svg', 'Horváth-Cziczka Nándor', 'C'),
('Portugália', 'https://kapowaz.github.io/square-flags/flags/pt.svg', 'Bőhm Balázs', 'C'),
('Litvánia', 'https://kapowaz.github.io/square-flags/flags/lt.svg', 'Firle-Kiss Balázs', 'C'),

('Málta', 'https://kapowaz.github.io/square-flags/flags/mt.svg', 'Dobra Milk', 'D'),
('Horvátország', 'https://kapowaz.github.io/square-flags/flags/hr.svg', 'Vécsey Atilla Bulcsú', 'D'),
('Belgium', 'https://kapowaz.github.io/square-flags/flags/be.svg', 'Falvay Pál', 'D'),
('Lengyelország', 'https://kapowaz.github.io/square-flags/flags/pl.svg', NULL, 'D'),

('Spanyolország', 'https://kapowaz.github.io/square-flags/flags/es.svg', 'Bognár István', 'X'),
('Ciprus', 'https://kapowaz.github.io/square-flags/flags/cy.svg', 'Sitkei Andor', 'X'),
('Szerbia', 'https://kapowaz.github.io/square-flags/flags/rs.svg', 'Terényi András Gábor', 'X'),
('Svédország', 'https://kapowaz.github.io/square-flags/flags/se.svg', 'Oláh Zoltán', 'X');

--@block
SELECT * FROM matches;

--@block
DROP TABLE IF EXISTS matches;
CREATE TABLE IF NOT EXISTS matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_letter VARCHAR(1),
  team1_id INT NOT NULL,
  team2_id INT NOT NULL,
  team1_score INT NOT NULL DEFAULT 0,
  team2_score INT NOT NULL DEFAULT 0,
  datetime VARCHAR(255),
  start_time VARCHAR(255),
  end_time VARCHAR(255),
  status VARCHAR(255) DEFAULT 'pending',
  FOREIGN KEY (team1_id) REFERENCES teams(id),
  FOREIGN KEY (team2_id) REFERENCES teams(id)
);


-- MAIN BLOK (56 mérkőzés)
-- 1. mérkőzés: A 19:00 – Hollandia vs Franciaország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Hollandia'),
  (SELECT id FROM teams WHERE name='Franciaország'),
  '2025-03-28 19:00',
  '19:00',
  '19:09',
  'pending'
);

-- 2. mérkőzés: A 19:09 – Csehország vs Olaszország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Csehország'),
  (SELECT id FROM teams WHERE name='Olaszország'),
  '2025-03-28 19:09',
  '19:09',
  '19:18',
  'pending'
);

-- 3. mérkőzés: B 19:18 – Magyarország vs Ausztria (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'B',
  (SELECT id FROM teams WHERE name='Magyarország'),
  (SELECT id FROM teams WHERE name='Ausztria'),
  '2025-03-28 19:18',
  '19:18',
  '19:27',
  'pending'
);

-- 4. mérkőzés: C 19:27 – Portugália vs Litvánia (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'C',
  (SELECT id FROM teams WHERE name='Portugália'),
  (SELECT id FROM teams WHERE name='Litvánia'),
  '2025-03-28 19:27',
  '19:27',
  '19:36',
  'pending'
);

-- 5. mérkőzés: D 19:36 – Málta vs Horvátország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'D',
  (SELECT id FROM teams WHERE name='Málta'),
  (SELECT id FROM teams WHERE name='Horvátország'),
  '2025-03-28 19:36',
  '19:36',
  '19:45',
  'pending'
);

-- 6. mérkőzés: A 19:45 – Románia vs Hollandia (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Románia'),
  (SELECT id FROM teams WHERE name='Hollandia'),
  '2025-03-28 19:45',
  '19:45',
  '19:54',
  'pending'
);

-- 7. mérkőzés: A 19:54 – Franciaország vs Csehország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Franciaország'),
  (SELECT id FROM teams WHERE name='Csehország'),
  '2025-03-28 19:54',
  '19:54',
  '20:03',
  'pending'
);

-- 8. mérkőzés: B 20:03 – Görögország vs Szlovákia (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'B',
  (SELECT id FROM teams WHERE name='Görögország'),
  (SELECT id FROM teams WHERE name='Szlovákia'),
  '2025-03-28 20:03',
  '20:03',
  '20:12',
  'pending'
);

-- 9. mérkőzés: C 20:12 – Bulgária vs Németország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'C',
  (SELECT id FROM teams WHERE name='Bulgária'),
  (SELECT id FROM teams WHERE name='Németország'),
  '2025-03-28 20:12',
  '20:12',
  '20:21',
  'pending'
);

-- 10. mérkőzés: D 20:21 – Belgium vs Lengyelország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'D',
  (SELECT id FROM teams WHERE name='Belgium'),
  (SELECT id FROM teams WHERE name='Lengyelország'),
  '2025-03-28 20:21',
  '20:21',
  '20:30',
  'pending'
);

-- 11. mérkőzés: A 20:30 – Olaszország vs Románia (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Olaszország'),
  (SELECT id FROM teams WHERE name='Románia'),
  '2025-03-28 20:30',
  '20:30',
  '20:39',
  'pending'
);

-- 12. mérkőzés: A 20:39 – Franciaország vs Hollandia (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Franciaország'),
  (SELECT id FROM teams WHERE name='Hollandia'),
  '2025-03-28 20:39',
  '20:39',
  '20:48',
  'pending'
);

-- 13. mérkőzés: B 20:48 – Magyarország vs Görögország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'B',
  (SELECT id FROM teams WHERE name='Magyarország'),
  (SELECT id FROM teams WHERE name='Görögország'),
  '2025-03-28 20:48',
  '20:48',
  '20:57',
  'pending'
);

-- 14. mérkőzés: C 20:57 – Portugália vs Németország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'C',
  (SELECT id FROM teams WHERE name='Portugália'),
  (SELECT id FROM teams WHERE name='Németország'),
  '2025-03-28 20:57',
  '20:57',
  '21:06',
  'pending'
);

-- 15. mérkőzés: D 21:06 – Málta vs Belgium (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'D',
  (SELECT id FROM teams WHERE name='Málta'),
  (SELECT id FROM teams WHERE name='Belgium'),
  '2025-03-28 21:06',
  '21:06',
  '21:15',
  'pending'
);

-- 16. mérkőzés: A 21:15 – Csehország vs Románia (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Csehország'),
  (SELECT id FROM teams WHERE name='Románia'),
  '2025-03-28 21:15',
  '21:15',
  '21:24',
  'pending'
);

-- 17. mérkőzés: A 21:24 – Hollandia vs Olaszország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Hollandia'),
  (SELECT id FROM teams WHERE name='Olaszország'),
  '2025-03-28 21:24',
  '21:24',
  '21:33',
  'pending'
);

-- 18. mérkőzés: B 21:33 – Ausztria vs Szlovákia (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'B',
  (SELECT id FROM teams WHERE name='Ausztria'),
  (SELECT id FROM teams WHERE name='Szlovákia'),
  '2025-03-28 21:33',
  '21:33',
  '21:42',
  'pending'
);

-- 19. mérkőzés: C 21:42 – Bulgária vs Litvánia (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'C',
  (SELECT id FROM teams WHERE name='Bulgária'),
  (SELECT id FROM teams WHERE name='Litvánia'),
  '2025-03-28 21:42',
  '21:42',
  '21:51',
  'pending'
);

-- 20. mérkőzés: D 21:51 – Horvátország vs Lengyelország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'D',
  (SELECT id FROM teams WHERE name='Horvátország'),
  (SELECT id FROM teams WHERE name='Lengyelország'),
  '2025-03-28 21:51',
  '21:51',
  '22:00',
  'pending'
);

-- 21. mérkőzés: A 22:00 – Románia vs Franciaország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Románia'),
  (SELECT id FROM teams WHERE name='Franciaország'),
  '2025-03-28 22:00',
  '22:00',
  '22:09',
  'pending'
);

-- 22. mérkőzés: A 22:09 – Hollandia vs Csehország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Hollandia'),
  (SELECT id FROM teams WHERE name='Csehország'),
  '2025-03-28 22:09',
  '22:09',
  '22:18',
  'pending'
);

-- 23. mérkőzés: B 22:18 – Magyarország vs Szlovákia (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'B',
  (SELECT id FROM teams WHERE name='Magyarország'),
  (SELECT id FROM teams WHERE name='Szlovákia'),
  '2025-03-28 22:18',
  '22:18',
  '22:27',
  'pending'
);

-- 24. mérkőzés: C 22:27 – Németország vs Litvánia (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'C',
  (SELECT id FROM teams WHERE name='Németország'),
  (SELECT id FROM teams WHERE name='Litvánia'),
  '2025-03-28 22:27',
  '22:27',
  '22:36',
  'pending'
);

-- 25. mérkőzés: D 22:36 – Málta vs Lengyelország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'D',
  (SELECT id FROM teams WHERE name='Málta'),
  (SELECT id FROM teams WHERE name='Lengyelország'),
  '2025-03-28 22:36',
  '22:36',
  '22:45',
  'pending'
);

-- 26. mérkőzés: A 22:45 – Franciaország vs Olaszország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Franciaország'),
  (SELECT id FROM teams WHERE name='Olaszország'),
  '2025-03-28 22:45',
  '22:45',
  '22:54',
  'pending'
);

-- 27. mérkőzés: A 22:54 – Hollandia vs Románia (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Hollandia'),
  (SELECT id FROM teams WHERE name='Románia'),
  '2025-03-28 22:54',
  '22:54',
  '23:03',
  'pending'
);

-- 28. mérkőzés: B 23:03 – Ausztria vs Görögország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'B',
  (SELECT id FROM teams WHERE name='Ausztria'),
  (SELECT id FROM teams WHERE name='Görögország'),
  '2025-03-28 23:03',
  '23:03',
  '23:12',
  'pending'
);

-- 29. mérkőzés: C 23:12 – Bulgária vs Portugália (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'C',
  (SELECT id FROM teams WHERE name='Bulgária'),
  (SELECT id FROM teams WHERE name='Portugália'),
  '2025-03-28 23:12',
  '23:12',
  '23:21',
  'pending'
);

-- 30. mérkőzés: D 23:21 – Horvátország vs Belgium (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'D',
  (SELECT id FROM teams WHERE name='Horvátország'),
  (SELECT id FROM teams WHERE name='Belgium'),
  '2025-03-28 23:21',
  '23:21',
  '23:30',
  'pending'
);

-- 31. mérkőzés: A 23:30 – Csehország vs Olaszország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Csehország'),
  (SELECT id FROM teams WHERE name='Olaszország'),
  '2025-03-28 23:30',
  '23:30',
  '23:39',
  'pending'
);

-- 32. mérkőzés: A 23:39 – Franciaország vs Románia (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Franciaország'),
  (SELECT id FROM teams WHERE name='Románia'),
  '2025-03-28 23:39',
  '23:39',
  '23:48',
  'pending'
);

-- 33. mérkőzés: B 23:48 – Ausztria vs Magyarország (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'B',
  (SELECT id FROM teams WHERE name='Ausztria'),
  (SELECT id FROM teams WHERE name='Magyarország'),
  '2025-03-28 23:48',
  '23:48',
  '23:57',
  'pending'
);

-- 34. mérkőzés: C 23:57 – Litvánia vs Portugália (2025-03-28)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'C',
  (SELECT id FROM teams WHERE name='Litvánia'),
  (SELECT id FROM teams WHERE name='Portugália'),
  '2025-03-28 23:57',
  '23:57',
  '00:06',
  'pending'
);

-- 35. mérkőzés: D 00:06 – Horvátország vs Málta (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'D',
  (SELECT id FROM teams WHERE name='Horvátország'),
  (SELECT id FROM teams WHERE name='Málta'),
  '2025-03-29 00:06',
  '00:06',
  '00:15',
  'pending'
);

-- 36. mérkőzés: A 00:15 – Franciaország vs Csehország (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Franciaország'),
  (SELECT id FROM teams WHERE name='Csehország'),
  '2025-03-29 00:15',
  '00:15',
  '00:24',
  'pending'
);

-- 37. mérkőzés: A 00:24 – Olaszország vs Hollandia (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Olaszország'),
  (SELECT id FROM teams WHERE name='Hollandia'),
  '2025-03-29 00:24',
  '00:24',
  '00:33',
  'pending'
);

-- 38. mérkőzés: B 00:33 – Szlovákia vs Görögország (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'B',
  (SELECT id FROM teams WHERE name='Szlovákia'),
  (SELECT id FROM teams WHERE name='Görögország'),
  '2025-03-29 00:33',
  '00:33',
  '00:42',
  'pending'
);

-- 39. mérkőzés: C 00:42 – Németország vs Bulgária (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'C',
  (SELECT id FROM teams WHERE name='Németország'),
  (SELECT id FROM teams WHERE name='Bulgária'),
  '2025-03-29 00:42',
  '00:42',
  '00:51',
  'pending'
);

-- 40. mérkőzés: D 00:51 – Lengyelország vs Belgium (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'D',
  (SELECT id FROM teams WHERE name='Lengyelország'),
  (SELECT id FROM teams WHERE name='Belgium'),
  '2025-03-29 00:51',
  '00:51',
  '01:00',
  'pending'
);

-- 41. mérkőzés: A 01:00 – Románia vs Olaszország (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Románia'),
  (SELECT id FROM teams WHERE name='Olaszország'),
  '2025-03-29 01:00',
  '01:00',
  '01:09',
  'pending'
);

-- 42. mérkőzés: B 01:09 – Görögország vs Magyarország (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'B',
  (SELECT id FROM teams WHERE name='Görögország'),
  (SELECT id FROM teams WHERE name='Magyarország'),
  '2025-03-29 01:09',
  '01:09',
  '01:18',
  'pending'
);

-- 43. mérkőzés: C 01:18 – Litvánia vs Bulgária (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'C',
  (SELECT id FROM teams WHERE name='Litvánia'),
  (SELECT id FROM teams WHERE name='Bulgária'),
  '2025-03-29 01:18',
  '01:18',
  '01:27',
  'pending'
);

-- 44. mérkőzés: D 01:27 – Belgium vs Málta (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'D',
  (SELECT id FROM teams WHERE name='Belgium'),
  (SELECT id FROM teams WHERE name='Málta'),
  '2025-03-29 01:27',
  '01:27',
  '01:36',
  'pending'
);

-- 45. mérkőzés: A 01:36 – Csehország vs Hollandia (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Csehország'),
  (SELECT id FROM teams WHERE name='Hollandia'),
  '2025-03-29 01:36',
  '01:36',
  '01:45',
  'pending'
);

-- 46. mérkőzés: B 01:45 – Szlovákia vs Ausztria (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'B',
  (SELECT id FROM teams WHERE name='Szlovákia'),
  (SELECT id FROM teams WHERE name='Ausztria'),
  '2025-03-29 01:45',
  '01:45',
  '01:54',
  'pending'
);

-- 47. mérkőzés: C 01:54 – Litvánia vs Németország (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'C',
  (SELECT id FROM teams WHERE name='Litvánia'),
  (SELECT id FROM teams WHERE name='Németország'),
  '2025-03-29 01:54',
  '01:54',
  '02:03',
  'pending'
);

-- 48. mérkőzés: D 02:03 – Lengyelország vs Horvátország (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'D',
  (SELECT id FROM teams WHERE name='Lengyelország'),
  (SELECT id FROM teams WHERE name='Horvátország'),
  '2025-03-29 02:03',
  '02:03',
  '02:12',
  'pending'
);

-- 49. mérkőzés: A 02:12 – Franciaország vs Olaszország (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Franciaország'),
  (SELECT id FROM teams WHERE name='Olaszország'),
  '2025-03-29 02:12',
  '02:12',
  '02:21',
  'pending'
);

-- 50. mérkőzés: B 02:21 – Szlovákia vs Magyarország (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'B',
  (SELECT id FROM teams WHERE name='Szlovákia'),
  (SELECT id FROM teams WHERE name='Magyarország'),
  '2025-03-29 02:21',
  '02:21',
  '02:30',
  'pending'
);

-- 51. mérkőzés: C 02:30 – Portugália vs Bulgária (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'C',
  (SELECT id FROM teams WHERE name='Portugália'),
  (SELECT id FROM teams WHERE name='Bulgária'),
  '2025-03-29 02:30',
  '02:30',
  '02:39',
  'pending'
);

-- 52. mérkőzés: D 02:39 – Lengyelország vs Málta (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'D',
  (SELECT id FROM teams WHERE name='Lengyelország'),
  (SELECT id FROM teams WHERE name='Málta'),
  '2025-03-29 02:39',
  '02:39',
  '02:48',
  'pending'
);

-- 53. mérkőzés: A 02:48 – Csehország vs Románia (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'A',
  (SELECT id FROM teams WHERE name='Csehország'),
  (SELECT id FROM teams WHERE name='Románia'),
  '2025-03-29 02:48',
  '02:48',
  '02:57',
  'pending'
);

-- 54. mérkőzés: B 02:57 – Görögország vs Ausztria (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'B',
  (SELECT id FROM teams WHERE name='Görögország'),
  (SELECT id FROM teams WHERE name='Ausztria'),
  '2025-03-29 02:57',
  '02:57',
  '03:06',
  'pending'
);

-- 55. mérkőzés: C 03:06 – Portugália vs Litvánia (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'C',
  (SELECT id FROM teams WHERE name='Portugália'),
  (SELECT id FROM teams WHERE name='Litvánia'),
  '2025-03-29 03:06',
  '03:06',
  '03:15',
  'pending'
);

-- 56. mérkőzés: D 03:15 – Belgium vs Horvátország (2025-03-29)
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'D',
  (SELECT id FROM teams WHERE name='Belgium'),
  (SELECT id FROM teams WHERE name='Horvátország'),
  '2025-03-29 03:15',
  '03:15',
  '03:24',
  'pending'
);

-- EXTRA BLOK (6 mérkőzés, csoport X, mind 2025-03-28)
-- 1. extra mérkőzés: X 18:00 – Spanyolország vs Szerbia
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'X',
  (SELECT id FROM teams WHERE name='Spanyolország'),
  (SELECT id FROM teams WHERE name='Szerbia'),
  '2025-03-28 18:00',
  '18:00',
  '18:10',
  'pending'
);

-- 2. extra mérkőzés: X 18:10 – Ciprus vs Svédország
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'X',
  (SELECT id FROM teams WHERE name='Ciprus'),
  (SELECT id FROM teams WHERE name='Svédország'),
  '2025-03-28 18:10',
  '18:10',
  '18:20',
  'pending'
);

-- 3. extra mérkőzés: X 18:20 – Szerbia vs Ciprus
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'X',
  (SELECT id FROM teams WHERE name='Szerbia'),
  (SELECT id FROM teams WHERE name='Ciprus'),
  '2025-03-28 18:20',
  '18:20',
  '18:30',
  'pending'
);

-- 4. extra mérkőzés: X 18:30 – Svédország vs Spanyolország
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'X',
  (SELECT id FROM teams WHERE name='Svédország'),
  (SELECT id FROM teams WHERE name='Spanyolország'),
  '2025-03-28 18:30',
  '18:30',
  '18:40',
  'pending'
);

-- 5. extra mérkőzés: X 18:40 – Spanyolország vs Ciprus
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'X',
  (SELECT id FROM teams WHERE name='Spanyolország'),
  (SELECT id FROM teams WHERE name='Ciprus'),
  '2025-03-28 18:40',
  '18:40',
  '18:50',
  'pending'
);

-- 6. extra mérkőzés: X 18:50 – Svédország vs Szerbia
INSERT INTO matches (group_letter, team1_id, team2_id, datetime, start_time, end_time, status)
VALUES (
  'X',
  (SELECT id FROM teams WHERE name='Svédország'),
  (SELECT id FROM teams WHERE name='Szerbia'),
  '2025-03-28 18:50',
  '18:50',
  '19:00',
  'pending'
);
