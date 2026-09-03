CREATE TABLE "ticket_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"owner_id" integer,
	CONSTRAINT "ticket_types_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
ALTER TABLE "ticket_types" ADD CONSTRAINT "ticket_types_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_types_global_name_unique" ON "ticket_types" USING btree (lower("name")) WHERE "ticket_types"."owner_id" is null;
--> statement-breakpoint
CREATE UNIQUE INDEX "ticket_types_owner_name_unique" ON "ticket_types" USING btree ("owner_id", lower("name")) WHERE "ticket_types"."owner_id" is not null;
--> statement-breakpoint
INSERT INTO "ticket_types" ("name") VALUES ('General'), ('VIP') ON CONFLICT DO NOTHING;
--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "ticket_type_id" integer;
--> statement-breakpoint
UPDATE "tickets"
SET "ticket_type_id" = "ticket_types"."id"
FROM "ticket_types"
WHERE "ticket_types"."owner_id" IS NULL
	AND lower("ticket_types"."name") = CASE "tickets"."type"
		WHEN 'vip' THEN 'vip'
		ELSE 'general'
	END;
--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "ticket_type_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "public"."ticket_types"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "tickets" DROP COLUMN "type";
