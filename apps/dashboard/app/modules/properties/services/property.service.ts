import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createPropertySchema,
  filterPropertySchema,
  paginationSchema,
  updatePropertySchema,
  uuidSchema,
} from "@afterdark/validators";
import { db, properties } from "@afterdark/db";
import { eq } from "drizzle-orm";

const getPropertiesInput = z.object({
  ...filterPropertySchema.shape,
  ...paginationSchema.shape,
});

const updatePropertyInput = updatePropertySchema.extend({ id: uuidSchema });

export const getPropertiesFn = createServerFn({ method: "GET" })
  .inputValidator(getPropertiesInput)
  .handler(async ({ data: _data }) => {
    return db.select().from(properties);
  });

export const getPropertyFn = createServerFn({ method: "GET" })
  .inputValidator(uuidSchema)
  .handler(async ({ data: id }) => {
    const [property] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
    return property ?? null;
  });

export const createPropertyFn = createServerFn({ method: "POST" })
  .inputValidator(createPropertySchema)
  .handler(async ({ data }) => {
    const [created] = await db
      .insert(properties)
      .values({ ...data, price: String(data.price) })
      .returning();
    return created;
  });

export const updatePropertyFn = createServerFn({ method: "POST" })
  .inputValidator(updatePropertyInput)
  .handler(async ({ data: { id, price, ...rest } }) => {
    const [updated] = await db
      .update(properties)
      .set({ ...rest, ...(price !== undefined ? { price: String(price) } : {}) })
      .where(eq(properties.id, id))
      .returning();
    return updated;
  });

export const deletePropertyFn = createServerFn({ method: "POST" })
  .inputValidator(uuidSchema)
  .handler(async ({ data: id }) => {
    await db.delete(properties).where(eq(properties.id, id));
  });
