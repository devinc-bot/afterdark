CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text NOT NULL,
	"avatar_id" integer,
	"birthday" text,
	"national_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	CONSTRAINT "users_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "owners" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text NOT NULL,
	"avatar_id" integer,
	"birthday" text,
	"national_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	CONSTRAINT "owners_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"tax_id" text,
	CONSTRAINT "organizations_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "organization_accounts_lnk" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	CONSTRAINT "organization_accounts_lnk_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "organization_accounts_lnk_organization_id_account_id_unique" UNIQUE("organization_id","account_id")
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text NOT NULL,
	"avatar_id" integer,
	"status" text DEFAULT 'active' NOT NULL,
	CONSTRAINT "staff_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"provider" text DEFAULT 'local' NOT NULL,
	"provider_account_id" text,
	CONSTRAINT "accounts_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "accounts_email_unique" UNIQUE("email"),
	CONSTRAINT "accounts_provider_account_id_unique" UNIQUE("provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "roles_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "account_role_lnk" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"account_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	CONSTRAINT "account_role_lnk_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "account_role_lnk_account_id_unique" UNIQUE("account_id")
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"url" text,
	"storage_key" text,
	"type" text,
	CONSTRAINT "assets_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"address" text NOT NULL,
	"street_number" text NOT NULL,
	"state" text NOT NULL,
	"city" text NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	CONSTRAINT "addresses_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "user_accounts_lnk" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	CONSTRAINT "user_accounts_lnk_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "owner_account_lnk" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"owner_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	CONSTRAINT "owner_account_lnk_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "staff_account_lnk" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"staff_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	CONSTRAINT "staff_account_lnk_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "owner_addresses_lnk" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"owner_id" integer NOT NULL,
	"address_id" integer NOT NULL,
	CONSTRAINT "owner_addresses_lnk_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "owner_addresses_lnk_owner_id_unique" UNIQUE("owner_id"),
	CONSTRAINT "owner_addresses_lnk_address_id_unique" UNIQUE("address_id")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"capacity" text NOT NULL,
	"description" text,
	"owner_id" integer NOT NULL,
	CONSTRAINT "locations_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "location_assets_lnk" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"location_id" integer NOT NULL,
	"asset_id" integer NOT NULL,
	CONSTRAINT "location_assets_lnk_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "location_addresses_lnk" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"location_id" integer NOT NULL,
	"address_id" integer NOT NULL,
	CONSTRAINT "location_addresses_lnk_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "location_addresses_lnk_location_id_unique" UNIQUE("location_id"),
	CONSTRAINT "location_addresses_lnk_address_id_unique" UNIQUE("address_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"location_id" integer NOT NULL,
	"organization_id" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"location" text,
	"status" text DEFAULT 'draft' NOT NULL,
	CONSTRAINT "events_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event_assets_lnk" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_id" integer NOT NULL,
	"asset_id" integer NOT NULL,
	CONSTRAINT "event_assets_lnk_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "event_faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_id" integer NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "event_faqs_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "services_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"description" text NOT NULL,
	"sale_starts_at" timestamp with time zone,
	"sale_ends_at" timestamp with time zone,
	"event_id" integer,
	"type" text DEFAULT 'general' NOT NULL,
	CONSTRAINT "tickets_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ticket_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" text,
	"amount" numeric(12, 2) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"provider" text DEFAULT 'mercado_pago' NOT NULL,
	"external_order_id" text,
	"metadata" jsonb,
	"paid_at" timestamp with time zone,
	CONSTRAINT "orders_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "orders_external_order_id_unique" UNIQUE("external_order_id")
);
--> statement-breakpoint
CREATE TABLE "tickets_sold" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"order_id" integer NOT NULL,
	"qr_code" text NOT NULL,
	"checked_in" boolean DEFAULT false NOT NULL,
	"used_at" timestamp (3) with time zone,
	"checked_in_by_account_id" integer,
	"checked_in_by_role" text,
	CONSTRAINT "tickets_sold_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "tickets_sold_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE "chat" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chat_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"from_id" integer NOT NULL,
	"to_id" integer NOT NULL,
	"content" text NOT NULL,
	"chat_id" integer NOT NULL,
	CONSTRAINT "messages_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "staff_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"organization_id" integer NOT NULL,
	"invited_by_owner_id" integer NOT NULL,
	"slug" text NOT NULL,
	"token" text NOT NULL,
	"security_word_hash" text,
	"expires_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"role" text DEFAULT 'staff' NOT NULL,
	"accepted_at" timestamp with time zone,
	CONSTRAINT "staff_invitations_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "staff_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"account_id" integer NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	CONSTRAINT "password_reset_tokens_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user_registration_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"token" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"last_name" text NOT NULL,
	"password_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	CONSTRAINT "user_registration_tokens_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "user_registration_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "owner_registration_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"token" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"last_name" text NOT NULL,
	"password_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	CONSTRAINT "owner_registration_tokens_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "owner_registration_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "api_error_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"method" varchar(16) NOT NULL,
	"path" varchar(2048) NOT NULL,
	"status_code" integer NOT NULL,
	"error_name" varchar(128) NOT NULL,
	"message" varchar(4096) NOT NULL,
	"stack" varchar(16384),
	"correlation_id" varchar(128),
	"fingerprint" varchar(64) DEFAULT 'legacy' NOT NULL,
	CONSTRAINT "api_error_records_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_assets_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owners" ADD CONSTRAINT "owners_avatar_id_assets_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_accounts_lnk" ADD CONSTRAINT "organization_accounts_lnk_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_accounts_lnk" ADD CONSTRAINT "organization_accounts_lnk_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_avatar_id_assets_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_role_lnk" ADD CONSTRAINT "account_role_lnk_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_role_lnk" ADD CONSTRAINT "account_role_lnk_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_accounts_lnk" ADD CONSTRAINT "user_accounts_lnk_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_accounts_lnk" ADD CONSTRAINT "user_accounts_lnk_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_account_lnk" ADD CONSTRAINT "owner_account_lnk_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_account_lnk" ADD CONSTRAINT "owner_account_lnk_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_account_lnk" ADD CONSTRAINT "staff_account_lnk_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_account_lnk" ADD CONSTRAINT "staff_account_lnk_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_addresses_lnk" ADD CONSTRAINT "owner_addresses_lnk_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_addresses_lnk" ADD CONSTRAINT "owner_addresses_lnk_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_assets_lnk" ADD CONSTRAINT "location_assets_lnk_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_assets_lnk" ADD CONSTRAINT "location_assets_lnk_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_addresses_lnk" ADD CONSTRAINT "location_addresses_lnk_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_addresses_lnk" ADD CONSTRAINT "location_addresses_lnk_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_assets_lnk" ADD CONSTRAINT "event_assets_lnk_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_assets_lnk" ADD CONSTRAINT "event_assets_lnk_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_faqs" ADD CONSTRAINT "event_faqs_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets_sold" ADD CONSTRAINT "tickets_sold_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets_sold" ADD CONSTRAINT "tickets_sold_checked_in_by_account_id_accounts_id_fk" FOREIGN KEY ("checked_in_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_from_id_users_id_fk" FOREIGN KEY ("from_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_to_id_users_id_fk" FOREIGN KEY ("to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_invitations" ADD CONSTRAINT "staff_invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_invitations" ADD CONSTRAINT "staff_invitations_invited_by_owner_id_owners_id_fk" FOREIGN KEY ("invited_by_owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_error_records_created_at_idx" ON "api_error_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "api_error_records_fingerprint_created_at_idx" ON "api_error_records" USING btree ("fingerprint","created_at");