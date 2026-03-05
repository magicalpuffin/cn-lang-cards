CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`secretHash` text NOT NULL,
	`createAt` integer NOT NULL
);
