create database bagsintrees;
use bagsintrees;

# general
grant ALL on bagsintrees.* to bags;

# settings
create table settings (settingKey varchar(32), settingValue varchar(32));
insert into settings (settingKey) values ('min_tag_id_zerolitter');

# photos
create table photos (id varchar(64)
					,created int
					,thumbnailUrl varchar(128)
					,lowResUrl varchar(128)
					,hiReslUrl varchar(128)
					,latitude varchar(32)
					,longitude varchar(32)
					,locationName varchar(32)
					,userId varchar(32)
					,userName varchar(64)
					,caption varchar(1000)
					,isRemoved boolean default 0
					);
alter table photos add constraint primary key pk_photos(id);
alter table photos add index ix_photos_userId(userId);
alter table photos add index ix_photos_latitude(latitude);

# users
create table users (id varchar(32) not null
					,name varchar(64) not null
					,profilePicture varchar(128)
					,tagCount int default 0
					,removedCount int default 0);
alter table users add constraint primary key pk_users(id);

# comments
create table comments (photoId varchar(64), created varchar(32), comment varchar(255), userId varchar(32));
alter table comments add constraint primary key pk_comments(photoId, userId, created);


