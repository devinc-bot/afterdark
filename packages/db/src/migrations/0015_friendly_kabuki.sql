ALTER TABLE `payments` RENAME TO `orders`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ticket_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`status` text,
	`amount` real NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`provider` text DEFAULT 'mercado_pago' NOT NULL,
	`metadata` text,
	FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "document_id", "created_at", "updated_at", "ticket_id", "user_id", "status", "amount", "quantity", "provider", "metadata") SELECT "id", "document_id", "created_at", "updated_at", "ticket_id", "user_id", "status", "amount", 1, 'mercado_pago', NULL FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `orders_document_id_unique` ON `orders` (`document_id`);