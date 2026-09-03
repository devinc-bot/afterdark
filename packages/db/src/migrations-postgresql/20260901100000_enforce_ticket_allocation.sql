DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "tickets_sold"
		WHERE "purchase_item_id" IS NULL OR "unit_index" IS NULL
	) THEN
		RAISE EXCEPTION 'Ticket allocation backfill failed: tickets_sold contains rows without purchase_item_id or unit_index';
	END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "tickets_sold" ALTER COLUMN "purchase_item_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "tickets_sold" ALTER COLUMN "unit_index" SET NOT NULL;
--> statement-breakpoint
DROP INDEX "tickets_sold_purchase_item_unit_index_unique";
--> statement-breakpoint
CREATE UNIQUE INDEX "tickets_sold_purchase_item_unit_index_unique" ON "tickets_sold" USING btree ("purchase_item_id", "unit_index");
