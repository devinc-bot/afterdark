import { integer, numeric, pgEnum, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { PROPERTY_STATUS } from "@afterdark/types";
import { baseColumns } from "./base";

export const propertyStatusEnum = pgEnum("property_status", [
  PROPERTY_STATUS.ACTIVE,
  PROPERTY_STATUS.INACTIVE,
]);

export const properties = pgTable("properties", {
  ...baseColumns,
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  status: propertyStatusEnum("status").notNull().default(PROPERTY_STATUS.ACTIVE),
});

export type PropertySelect = typeof properties.$inferSelect;
export type PropertyInsert = typeof properties.$inferInsert;
