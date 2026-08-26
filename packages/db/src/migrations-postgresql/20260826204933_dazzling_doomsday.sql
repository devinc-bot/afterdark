CREATE TABLE "account_legal_acceptances" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"account_id" integer NOT NULL,
	"legal_document_id" integer NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_legal_acceptances_document_id_unique" UNIQUE("document_id"),
	CONSTRAINT "account_legal_acceptances_account_id_legal_document_id_unique" UNIQUE("account_id","legal_document_id")
);
--> statement-breakpoint
ALTER TABLE "account_legal_acceptances" ADD CONSTRAINT "account_legal_acceptances_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_legal_acceptances" ADD CONSTRAINT "account_legal_acceptances_legal_document_id_legal_documents_id_fk" FOREIGN KEY ("legal_document_id") REFERENCES "public"."legal_documents"("id") ON DELETE cascade ON UPDATE no action;