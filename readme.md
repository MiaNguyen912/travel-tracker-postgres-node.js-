To run this app:
1. Open pgAdmin and create a 'world' database

2. create country table 'country' in 'world' database
    create table country(
        id serial primary key,
        country_code TEXT NOT NULL UNIQUE,
        country_name TEXT
    )
    Then import countries.csv into this table

3. create tables 'page_user' and 'visited_country' in the 'world' database:
    DROP TABLE IF EXISTS visited_country, page_user;

    CREATE TABLE page_user(
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        color TEXT
    );

    CREATE TABLE visited_country(
        id SERIAL PRIMARY KEY,
        country_code CHAR(2) NOT NULL,
        user_id INTEGER REFERENCES page_user(id)
    );

    INSERT INTO page_user (name, color)
    VALUES ('Angela', 'teal'), ('Jack', 'powderblue');

    INSERT INTO visited_country (country_code, user_id)
    VALUES ('FR', 1), ('GB', 1), ('CA', 2), ('FR', 2 );

    SELECT * FROM visited_country JOIN page_user ON page_user.id = user_id;