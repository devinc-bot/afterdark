CREATE TABLE "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3),
	"expires_at" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"state_version" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "purchases_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "purchases_total_amount_non_negative" CHECK ("total_amount" >= 0),
	CONSTRAINT "purchases_status_valid" CHECK ("status" IN ('pending', 'confirmed', 'expired', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "purchase_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"purchase_id" integer NOT NULL,
	"ticket_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	CONSTRAINT "purchase_items_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "purchase_items_quantity_positive" CHECK ("quantity" > 0),
	CONSTRAINT "purchase_items_unit_price_non_negative" CHECK ("unit_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"purchase_item_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"released_at" timestamp with time zone,
	CONSTRAINT "inventory_reservations_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "inventory_reservations_quantity_positive" CHECK ("quantity" > 0),
	CONSTRAINT "inventory_reservations_status_valid" CHECK ("status" IN ('active', 'consumed', 'released', 'expired'))
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"purchase_id" integer NOT NULL,
	"provider" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3),
	"provider_preference_id" text,
	"provider_payment_id" text,
	"metadata" jsonb,
	"paid_at" timestamp with time zone,
	"reconciled_at" timestamp with time zone,
	"reconciliation_error" text,
	CONSTRAINT "payments_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "payments_amount_non_negative" CHECK ("amount" >= 0),
	CONSTRAINT "payments_provider_valid" CHECK ("provider" = 'mercado_pago'),
	CONSTRAINT "payments_status_valid" CHECK ("status" IN ('pending', 'approved', 'rejected', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "payment_webhook_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"provider" text NOT NULL,
	"provider_event_id" text,
	"provider_payment_id" text,
	"payment_id" integer,
	"status" text DEFAULT 'received' NOT NULL,
	"payload" jsonb NOT NULL,
	"processing_attempts" integer DEFAULT 0 NOT NULL,
	"processed_at" timestamp with time zone,
	"last_error" text,
	CONSTRAINT "payment_webhook_events_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "payment_webhook_events_provider_valid" CHECK ("provider" = 'mercado_pago'),
	CONSTRAINT "payment_webhook_events_status_valid" CHECK ("status" IN ('received', 'processing', 'processed', 'failed'))
);
--> statement-breakpoint
CREATE TABLE "domain_outbox_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"aggregate_type" text NOT NULL,
	"aggregate_document_id" uuid NOT NULL,
	"aggregate_version" integer NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"publish_attempts" integer DEFAULT 0 NOT NULL,
	"locked_at" timestamp with time zone,
	"lock_token" uuid,
	"last_error" text,
	CONSTRAINT "domain_outbox_events_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "availability_version" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "tickets_sold" ADD COLUMN "purchase_item_id" integer;
--> statement-breakpoint
ALTER TABLE "tickets_sold" ADD COLUMN "unit_index" integer;
--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_purchase_item_id_purchase_items_id_fk" FOREIGN KEY ("purchase_item_id") REFERENCES "public"."purchase_items"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "tickets_sold" ADD CONSTRAINT "tickets_sold_purchase_item_id_purchase_items_id_fk" FOREIGN KEY ("purchase_item_id") REFERENCES "public"."purchase_items"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "purchases_user_created_at_idx" ON "purchases" USING btree ("user_id", "created_at");
--> statement-breakpoint
CREATE INDEX "purchases_pending_expires_at_idx" ON "purchases" USING btree ("expires_at") WHERE "purchases"."status" = 'pending';
--> statement-breakpoint
CREATE UNIQUE INDEX "purchase_items_purchase_ticket_unique" ON "purchase_items" USING btree ("purchase_id", "ticket_id");
--> statement-breakpoint
CREATE INDEX "purchase_items_ticket_id_idx" ON "purchase_items" USING btree ("ticket_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_reservations_purchase_item_unique" ON "inventory_reservations" USING btree ("purchase_item_id");
--> statement-breakpoint
CREATE INDEX "inventory_reservations_active_expires_at_idx" ON "inventory_reservations" USING btree ("expires_at") WHERE "inventory_reservations"."status" = 'active';
--> statement-breakpoint
CREATE INDEX "payments_purchase_created_at_idx" ON "payments" USING btree ("purchase_id", "created_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "payments_provider_preference_unique" ON "payments" USING btree ("provider", "provider_preference_id") WHERE "payments"."provider_preference_id" IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "payments_provider_payment_unique" ON "payments" USING btree ("provider", "provider_payment_id") WHERE "payments"."provider_payment_id" IS NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX "payment_webhook_events_provider_event_unique" ON "payment_webhook_events" USING btree ("provider", "provider_event_id") WHERE "payment_webhook_events"."provider_event_id" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX "payment_webhook_events_provider_payment_idx" ON "payment_webhook_events" USING btree ("provider", "provider_payment_id");
--> statement-breakpoint
CREATE INDEX "payment_webhook_events_pending_idx" ON "payment_webhook_events" USING btree ("status", "created_at") WHERE "payment_webhook_events"."status" IN ('received', 'failed');
--> statement-breakpoint
CREATE UNIQUE INDEX "domain_outbox_events_aggregate_version_unique" ON "domain_outbox_events" USING btree ("aggregate_type", "aggregate_document_id", "aggregate_version");
--> statement-breakpoint
CREATE INDEX "domain_outbox_events_unpublished_created_at_idx" ON "domain_outbox_events" USING btree ("created_at") WHERE "domain_outbox_events"."published_at" IS NULL;
