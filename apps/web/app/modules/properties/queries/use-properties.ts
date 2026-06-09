import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type { PaginationParams } from "@afterdark/types";
import { getPropertiesFn } from "../services/property.service";

export const propertiesQueryOptions = (params: PaginationParams = { page: 1, limit: 10 }) =>
  queryOptions({
    queryKey: ["properties", params],
    queryFn: () => getPropertiesFn({ data: params }),
  });

export function useProperties(params?: PaginationParams) {
  return useSuspenseQuery(propertiesQueryOptions(params));
}
