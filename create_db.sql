create database rozlicz;
use rozlicz;

create table User (
    username varchar(32) primary key,
    password varchar(32) not null
);

create table Team (
    team_id integer not null auto_increment primary key,
    name varchar(32) not null,
    begin_date date not null,
    username varchar(32) not null references User
);

create table Member (
    team_id integer not null references Team,
    username varchar(32) not null references User
);

create table Payment (
    payment_id integer auto_increment primary key,
    name varchar(100) not null,
    money integer not null,
    team_id integer not null references Team,
    payer varchar(32) not null references User,
    date date not null
);

create table Debtor (
    payment_id integer not null references Payment,
    username varchar(32) not null references User
);
