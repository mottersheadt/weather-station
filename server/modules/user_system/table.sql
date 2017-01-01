
CREATE TABLE `users` (
       `user_id`		int(10)		PRIMARY KEY AUTO_INCREMENT,
       `user_uuid`		varchar(50)	DEFAULT NULL UNIQUE KEY,
       `user_level`		int(10)		DEFAULT 1,
       `first_name`    		varchar(255),
       `last_name`    		varchar(255),
       `email`			varchar(255)	DEFAULT NULL UNIQUE KEY,
       `blocked`		tinyint(1)	DEFAULT 0,
       `metadata`		MEDIUMTEXT,
       `active`			tinyint(1)	DEFAULT 1
) ENGINE=INNODB;
