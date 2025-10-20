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
UPDATE team_categories
SET
  color_code = CASE
    WHEN name = 'Röplabda' THEN 'warning'
    WHEN name = 'Foci' THEN 'success'
    WHEN name = 'Ping-pong' THEN 'primary'
    WHEN name = 'Clash Royale 2v2' THEN 'secondary'
    WHEN name = 'Clash Royale Triple Draft' THEN 'foreground'
    ELSE color_code
  END;

--@block
DROP TABLE IF EXISTS teams;

DROP TABLE IF EXISTS team_categories;

CREATE TABLE
  IF NOT EXISTS team_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(255) NOT NULL,
    color_code VARCHAR(255) NOT NULL
  );

INSERT INTO
  team_categories (name, short_name, color_code)
VALUES
  ('Röplabda', 'Röpi', 'red'),
  ('Foci', 'Foci', 'green'),
  ('Ping-pong', 'Ping-pong', 'blue'),
  ('Clash Royale 2v2', 'CR 2v2', 'yellow'),
  (
    'Clash Royale Triple Draft',
    'CR Triple Draft',
    'cyan'
  );

CREATE TABLE
  IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    team_leader VARCHAR(255),
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES team_categories (id)
  );

INSERT INTO
  teams (name, category_id)
VALUES
  ('Tarka macska', 1),
  ('hatvanhét', 1),
  ('Cenzúra', 1),
  ('12f', 1),
  ('Csipet Csapat', 1),
  ('Sós röpi', 1),
  ('JobbmintaKáresz', 1),
  ('Cirkusz', 1),
  ('Ördögök útja', 1),
  ('Tarka macska', 1),
  ('Fireball', 1),
  ('Csemeték', 1),
  ('Népligeti gicányok', 2),
  ('Cenzúrák', 2),
  ('Matyichester united', 2),
  ('Papírkutyák', 2),
  ('La Masia FC', 2),
  ('Bömbi a király FC', 2),
  ('Erik A Verőember ', 2),
  ('KFC FC', 2),
  ('Inter', 2),
  ('Tsapat', 2),
  ('Vodkacsák Se', 2),
  ('Favágó FC', 2),
  ('Horti Gábor katonái', 2),
  ('Sztróker FC', 2),
  ('Kárpátaljai brazilok', 2),
  ('Sumi', 2),
  ('MediGenX', 2),
  ('11.C', 2),
  ('Faltörők', 3),
  ('Könyvmoly klub', 3),
  ('Sörpong', 3),
  ('Andris', 3),
  ('11D', 3),
  ('Pörköltek krumplipürével', 3),
  ('Szilvás gombócok', 3),
  ('Katyusha ', 3),
  ('Hajsó', 3),
  ('Cenzúra duo', 3),
  ('我在开会呢没听见', 3),
  ('PingPong Pörkölt', 3),
  ('Full mindegy', 3),
  ('Sztróker PPC', 3),
  ('Zorpa', 3),
  ('Szeretjükaszőlőt', 3),
  ('Shubidubi', 3),
  ('Saját válasz', 3),
  ('MK', 4),
  ('Balázska', 4),
  ('Mystery Inc.', 4),
  ('Sneaky Golem', 4),
  ('Nagyfiúk', 4),
  ('Titanic swim team', 4),
  ('Goblinok', 4),
  ('Zsizsi', 4),
  ('Haramball Cycle', 4),
  ('BLÅHAJ Krigare ', 4),
  ('This is why we clash', 4),
  ('Alattomos Gólemek', 4),
  ('megaknight imádók', 4),
  ('Csapatnév', 4),
  ('Sztróker Royale', 4),
  ('aa', 4),
  ('Larry Cycle', 4),
  ('In memoriam OKGY', 4),
  ('Spielerek', 4),
  ('Mimimimimi', 4),
  ('Bowling', 4),
  ('GCC', 4),
  ('Srácok', 4),
  ('Saját válasz', 4),
  ('Illés Gergő (11.C)', 5),
  ('Svorcz levente (10.D)', 5),
  ('Wang Xiangzhe (7.A)', 5),
  ('Benő Nimród (7.B)', 5),
  ('Koós Tamás (10.A)', 5),
  ('Iodi Erik (12.C)', 5),
  ('Bieber Máté (9.B)', 4),
  ('Orovica Valér (7.B)', 4),
  ('9.F', 5),
  ('Szepesi Zoli (11.A)', 5),
  ('Hernáth Bence Bernát (9.Ny)', 5),
  ('Farkas Norbert (9.Ny)', 5),
  ('Dévényi Ádám János (9.Ny)', 5),
  ('Spiller-Giliga Máté (9.Ny)', 5);

--@block
DROP TABLE IF EXISTS matches;

--@block
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

--@block