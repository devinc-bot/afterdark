import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import { listLegalDocuments } from '../services/legal-documents.service'

export function useLegalDocumentsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.legalDocuments(),
    queryFn: listLegalDocuments,
  })
}
