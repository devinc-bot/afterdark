CREATE TYPE "public"."legal_document_type" AS ENUM('termsDashboard', 'termsWeb', 'privacyDashboard', 'privacyWeb');--> statement-breakpoint
CREATE TABLE "legal_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"type" "legal_document_type" NOT NULL,
	"version" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" jsonb NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"requires_acceptance" boolean DEFAULT true NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "legal_documents_document_id_unique" UNIQUE("document_id")
);
