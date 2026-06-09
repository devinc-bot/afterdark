import { useQueryClient } from "@tanstack/react-query";
import { createPropertyFn, deletePropertyFn, updatePropertyFn } from "../services/property.service";
import type { CreatePropertyInput, UpdatePropertyInput } from "@afterdark/validators";

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return async (data: CreatePropertyInput) => {
    const result = await createPropertyFn({ data });
    await queryClient.invalidateQueries({ queryKey: ["properties"] });
    return result;
  };
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();
  return async (id: string, data: UpdatePropertyInput) => {
    const result = await updatePropertyFn({ data: { id, ...data } });
    await queryClient.invalidateQueries({ queryKey: ["properties"] });
    return result;
  };
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return async (id: string) => {
    await deletePropertyFn({ data: id });
    await queryClient.invalidateQueries({ queryKey: ["properties"] });
  };
}
