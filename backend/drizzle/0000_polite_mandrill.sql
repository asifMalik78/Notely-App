CREATE TABLE `boards` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `boards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `columns` (
	`id` varchar(36) NOT NULL,
	`board_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `columns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `labels` (
	`id` varchar(36) NOT NULL,
	`board_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`color` varchar(7) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `labels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_labels` (
	`task_id` varchar(36) NOT NULL,
	`label_id` varchar(36) NOT NULL,
	CONSTRAINT `task_labels_task_id_label_id_pk` PRIMARY KEY(`task_id`,`label_id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` varchar(36) NOT NULL,
	`column_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`due_date` timestamp,
	`position` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255),
	`name` varchar(255) NOT NULL,
	`avatar_url` varchar(500),
	`dob` timestamp,
	`description` text,
	`provider` varchar(50),
	`provider_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `boards` ADD CONSTRAINT `boards_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `columns` ADD CONSTRAINT `columns_board_id_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `labels` ADD CONSTRAINT `labels_board_id_boards_id_fk` FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_labels` ADD CONSTRAINT `task_labels_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_labels` ADD CONSTRAINT `task_labels_label_id_labels_id_fk` FOREIGN KEY (`label_id`) REFERENCES `labels`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_column_id_columns_id_fk` FOREIGN KEY (`column_id`) REFERENCES `columns`(`id`) ON DELETE cascade ON UPDATE no action;