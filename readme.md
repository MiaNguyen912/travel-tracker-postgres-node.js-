To run this app:
1. Open pgAdmin and create a 'world' database, then create table 'visited_country':
    create table visited_country(
        id serial primary key,
        country_code TEXT NOT NULL UNIQUE
    )
2. create country table in 'world' database
    create table country(
        id serial primary key,
        country_code TEXT NOT NULL UNIQUE,
        country_name TEXT
    )
    Then import countries.csv into this table
