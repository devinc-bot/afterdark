import { queryOptions, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { fetchStaffPersonnel } from '~/modules/staff/services/staff-personnel.service'
import { mapStaffPersonnelItemToStaffUserRecord } from '~/modules/staff/utils/staff-personnel.mapper'

export const staffPersonnelQueryOptions = () =>
  queryOptions({
    queryKey: QUERY_KEYS.staffPersonnel(),
    queryFn: async () => {
      const items = await fetchStaffPersonnel()
      return items.map(mapStaffPersonnelItemToStaffUserRecord)
    },
  })

export function useStaffPersonnel() {
  return useQuery({
    ...staffPersonnelQueryOptions(),
    throwOnError: false,
  })
}
