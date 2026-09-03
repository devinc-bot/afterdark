DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "orders"
		WHERE "quantity" <= 0
			OR "amount" < 0
			OR "provider" <> 'mercado_pago'
			OR "status" IS NULL
			OR "status" NOT IN ('pending', 'completed', 'rejected', 'cancelled')
			OR ("status" = 'completed' AND "paid_at" IS NULL)
			OR ("status" IS DISTINCT FROM 'completed' AND "paid_at" IS NOT NULL)
	) THEN
		RAISE EXCEPTION 'Legacy order audit failed: invalid order lifecycle or amount data';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "orders" o
		LEFT JOIN "tickets_sold" ts ON ts."order_id" = o."id"
		GROUP BY o."id", o."status", o."quantity"
		HAVING
			(o."status" = 'completed' AND count(ts."id") <> o."quantity")
			OR (o."status" IS DISTINCT FROM 'completed' AND count(ts."id") > 0)
	) THEN
		RAISE EXCEPTION 'Legacy order audit failed: issued ticket counts are inconsistent';
	END IF;

	IF EXISTS (
		WITH "completed_order_quantities" AS (
			SELECT "ticket_id", sum("quantity") AS "completed_quantity"
			FROM "orders"
			WHERE "status" = 'completed'
			GROUP BY "ticket_id"
		)
		SELECT 1
		FROM "tickets" t
		LEFT JOIN "completed_order_quantities" coq ON coq."ticket_id" = t."id"
		WHERE coalesce(coq."completed_quantity", 0) > t."quantity"
	) THEN
		RAISE EXCEPTION 'Legacy order audit failed: completed quantities exceed ticket capacity';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "tickets_sold"
		WHERE ("checked_in" AND "used_at" IS NULL)
			OR (NOT "checked_in" AND (
				"used_at" IS NOT NULL
				OR "checked_in_by_account_id" IS NOT NULL
				OR "checked_in_by_role" IS NOT NULL
			))
			OR (("checked_in_by_account_id" IS NULL) <> ("checked_in_by_role" IS NULL))
	) THEN
		RAISE EXCEPTION 'Legacy order audit failed: ticket check-in data is inconsistent';
	END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "purchase_items" ADD COLUMN "line_total" numeric(12, 2);
--> statement-breakpoint
INSERT INTO "purchases" (
	"document_id",
	"created_at",
	"updated_at",
	"user_id",
	"status",
	"total_amount",
	"currency",
	"expires_at",
	"confirmed_at",
	"cancelled_at",
	"state_version"
)
SELECT
	o."document_id",
	o."created_at",
	o."updated_at",
	o."user_id",
	CASE o."status"
		WHEN 'completed' THEN 'confirmed'
		WHEN 'pending' THEN 'expired'
		ELSE 'cancelled'
	END,
	o."amount",
	'ARS',
	CASE WHEN o."status" = 'pending' THEN o."updated_at" ELSE NULL END,
	CASE WHEN o."status" = 'completed' THEN o."paid_at" ELSE NULL END,
	CASE WHEN o."status" IN ('rejected', 'cancelled') THEN o."updated_at" ELSE NULL END,
	0
FROM "orders" o;
--> statement-breakpoint
INSERT INTO "purchase_items" (
	"document_id",
	"created_at",
	"updated_at",
	"purchase_id",
	"ticket_id",
	"quantity",
	"unit_price",
	"line_total"
)
SELECT
	gen_random_uuid(),
	o."created_at",
	o."updated_at",
	p."id",
	o."ticket_id",
	o."quantity",
	o."amount" / o."quantity",
	o."amount"
FROM "orders" o
JOIN "purchases" p ON p."document_id" = o."document_id";
--> statement-breakpoint
INSERT INTO "payments" (
	"document_id",
	"created_at",
	"updated_at",
	"purchase_id",
	"provider",
	"status",
	"amount",
	"currency",
	"provider_preference_id",
	"metadata",
	"paid_at",
	"reconciled_at"
)
SELECT
	gen_random_uuid(),
	o."created_at",
	o."updated_at",
	p."id",
	o."provider",
	CASE o."status"
		WHEN 'completed' THEN 'approved'
		WHEN 'pending' THEN 'cancelled'
		ELSE o."status"
	END,
	o."amount",
	'ARS',
	o."external_order_id",
	o."metadata",
	o."paid_at",
	CASE WHEN o."status" = 'completed' THEN o."updated_at" ELSE NULL END
FROM "orders" o
JOIN "purchases" p ON p."document_id" = o."document_id";
--> statement-breakpoint
WITH "ranked_tickets_sold" AS (
	SELECT
		ts."id",
		pi."id" AS "purchase_item_id",
		row_number() OVER (PARTITION BY pi."id" ORDER BY ts."id") - 1 AS "unit_index"
	FROM "tickets_sold" ts
	JOIN "orders" o ON o."id" = ts."order_id"
	JOIN "purchases" p ON p."document_id" = o."document_id"
	JOIN "purchase_items" pi ON pi."purchase_id" = p."id" AND pi."ticket_id" = o."ticket_id"
)
UPDATE "tickets_sold" ts
SET
	"purchase_item_id" = ranked."purchase_item_id",
	"unit_index" = ranked."unit_index"
FROM "ranked_tickets_sold" ranked
WHERE ts."id" = ranked."id";
--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "currency" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "currency" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "purchase_items" ALTER COLUMN "line_total" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_line_total_non_negative" CHECK ("line_total" >= 0);
--> statement-breakpoint
CREATE UNIQUE INDEX "tickets_sold_purchase_item_unit_index_unique" ON "tickets_sold" USING btree ("purchase_item_id", "unit_index") WHERE "tickets_sold"."purchase_item_id" IS NOT NULL AND "tickets_sold"."unit_index" IS NOT NULL;
