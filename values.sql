insert into User values ('alicja', 'rojan');
insert into User values ('szymon', 'zwara');
insert into User values ('mateusz', 'kobak');
insert into User values ('piotr', 'grzegorczyk');
insert into User values ('kasia', 'pazdan');
insert into User values ('ambro', 'ambroszczyk');

insert into Team (name, begin_date, username) values ('broniwoja', '2017-09-01', 'alicja');
insert into Team (name, begin_date, username) values ('sniadeckich', '2017-09-01', 'mateusz');

insert into Member values (1, 'alicja');
insert into Member values (1, 'kasia');
insert into Member values (2, 'piotr');
insert into Member values (2, 'mateusz');
insert into Member values (2, 'szymon');
insert into Member values (2, 'ambro');

insert into Payment (name, money, team_id, payer, date) values ("szynka", 200, 1, 'alicja', '2017-10-01');
  insert into Debtor values (1, 'alicja');
  insert into Debtor values (1, 'kasia');
insert into Payment (name, money, team_id, payer, date) values ("ser", 220, 1, 'alicja', '2017-10-02');
  insert into Debtor values (2, 'alicja');
  insert into Debtor values (2, 'kasia');
insert into Payment (name, money, team_id, payer, date) values ("maslo", 250, 1, 'kasia', '2017-10-03');
  insert into Debtor values (3, 'alicja');
  insert into Debtor values (3, 'kasia');
insert into Payment (name, money, team_id, payer, date) values ("chleb", 800, 2, 'mateusz', '2017-10-04');
  insert into Debtor values (4, 'mateusz');
  insert into Debtor values (4, 'szymon');
  insert into Debtor values (4, 'piotr');
insert into Payment (name, money, team_id, payer, date) values ("cebula", 90, 2, 'mateusz', '2017-10-05');
  insert into Debtor values (5, 'mateusz');
  insert into Debtor values (5, 'szymon');
  insert into Debtor values (5, 'piotr');
insert into Payment (name, money, team_id, payer, date) values ("miod", 105, 2, 'szymon', '2017-10-06');
  insert into Debtor values (6, 'mateusz');
  insert into Debtor values (6, 'szymon');
  insert into Debtor values (6, 'piotr');
insert into Payment (name, money, team_id, payer, date) values ("herbata", 1000, 2, 'szymon', '2017-10-07');
  insert into Debtor values (7, 'mateusz');
  insert into Debtor values (7, 'szymon');
  insert into Debtor values (7, 'piotr');
insert into Payment (name, money, team_id, payer, date) values ("czekolada", 320, 2, 'piotr', '2017-10-08');
  insert into Debtor values (8, 'szymon');
  insert into Debtor values (8, 'piotr');
  insert into Debtor values (8, 'ambro');
insert into Payment (name, money, team_id, payer, date) values ("baklazan", 100, 2, 'piotr', '2017-10-09');
  insert into Debtor values (9, 'mateusz');
  insert into Debtor values (9, 'szymon');
  insert into Debtor values (9, 'piotr');
