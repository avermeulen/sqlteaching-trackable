create table the_user(
    id serial not null primary key,
    full_name varchar(100),
    user_name varchar(40),
    joined_at timestamp,
    active boolean,
    activated_at timestamp,
    admin boolean
);

create table user_progress(
    id serial not null primary key,
    user_name varchar(40),
    task_name varchar(30),
    completed_at timestamp
);