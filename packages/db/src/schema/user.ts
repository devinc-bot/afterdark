import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";
import { USER_ROLE } from "@afterdark/types";
import { baseColumns } from "./base";

export const userRoleEnum = pgEnum("user_role", [USER_ROLE.ADMIN, USER_ROLE.STAFF]);

export const users = pgTable("users", {
  ...baseColumns,
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default(USER_ROLE.STAFF),
});

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
