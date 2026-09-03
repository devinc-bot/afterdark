CREATE TABLE "account_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"account_id" integer NOT NULL,
	"client_app" text NOT NULL,
	"refresh_token_hash" text NOT NULL,
	"refresh_token_version" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"ip_address" varchar(45),
	"device" varchar(255),
	"user_agent" varchar(512),
	"city" varchar(255),
	"state" varchar(255),
	"country" varchar(255),
	CONSTRAINT "account_sessions_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
ALTER TABLE "account_sessions" ADD CONSTRAINT "account_sessions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "account_sessions_account_active_created_at_idx" ON "account_sessions" USING btree ("account_id","revoked_at","expires_at","created_at");
--> statement-breakpoint
CREATE INDEX "account_sessions_terminal_at_idx" ON "account_sessions" USING btree ("expires_at","revoked_at");
