-- to get the encrypted password, go to bcrypt-generator.com, and choose the cipher length (Rounds) value = 10
insert into users (username, password, enabled) values ('guest', '{bcrypt}$2a$10$uPgB61vMyZ0RlY8bwZeKkuGpEhsFL/cYU3n8JXSjaBjAUxwXN46PW', true);
insert into authorities (username, authority) values ('guest', 'ROLE_ADMIN');
