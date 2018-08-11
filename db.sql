create table the_user(
    id serial not null primary key,
    user_name varchar(40),
    active boolean,
    admin boolean
);

create table user_progress(
    id serial not null primary key,
    user_name varchar(40),
    task_name varchar(30)
);