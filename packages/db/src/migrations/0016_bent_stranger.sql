CREATE TABLE `tickets_sold` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`order_id` integer NOT NULL,
	`qr_code` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tickets_sold_document_id_unique` ON `tickets_sold` (`document_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `tickets_sold_qr_code_unique` ON `tickets_sold` (`qr_code`);