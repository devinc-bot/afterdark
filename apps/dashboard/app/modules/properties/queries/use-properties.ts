import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { PaginationParams } from "@afterdark/types";
import { getPropertiesFn, getPropertyFn } from "../services/property.service";

export const propertiesQueryOptions = (params: PaginationParams = { page: 1, limit: 10 }) =>
  queryOptions({
    queryKey: ["properties", params],
    queryFn: () => getPropertiesFn({ data: params }),
  });

export const propertyQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["properties", id],
    queryFn: () => getPropertyFn({ data: id }),
  });

export function useProperties(params?: PaginationParams) {
  return useSuspenseQuery(propertiesQueryOptions(params));
}

export function useProperty(id: string) {
  return useSuspenseQuery(propertyQueryOptions(id));
}
