create table users(
	username varchar(50) not null primary key,
	password varchar(200) not null,
	enabled boolean not null
);

create table authorities (
	username varchar(50) not null,
	authority varchar(50) not null,
	constraint fk_authorities_users foreign key(username) references users(username)
);

create table api_keys(
                         api_key_hash varchar(64) primary key,
                         username varchar(50) not null,
                         constraint fk_api_keys_users foreign key(username) references users(username)
);