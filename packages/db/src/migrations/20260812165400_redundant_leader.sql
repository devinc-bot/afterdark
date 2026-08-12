CREATE TABLE `api_error_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`method` text(16) NOT NULL,
	`path` text(2048) NOT NULL,
	`status_code` integer NOT NULL,
	`error_name` text(128) NOT NULL,
	`message` text(4096) NOT NULL,
	`stack` text(16384),
	`correlation_id` text(128)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_error_records_document_id_unique` ON `api_error_records` (`document_id`);--> statement-breakpoint
CREATE INDEX `api_error_records_created_at_idx` ON `api_error_records` (`created_at`);