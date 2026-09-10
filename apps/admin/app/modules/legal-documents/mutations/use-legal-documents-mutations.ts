import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { LegalDocumentType } from '@repo/types'
import type { SaveLegalDocumentDraftInput } from '@repo/validators'
import { toast } from '@repo/ui'
import { useTranslation } from 'react-i18next'
import { QUERY_KEYS } from '~/modules/common/constants/query-keys'
import {
  LEGAL_DOCUMENT_TOAST_ACTION,
  legalDocumentToastI18nKey,
} from '../constants/legal-document-toast'
import { publish, saveDraft } from '../services/legal-documents.service'

export function useSaveLegalDocumentDraft() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('admin')

  return useMutation({
    mutationFn: ({
      type,
      input,
    }: {
      type: LegalDocumentType
      input: SaveLegalDocumentDraftInput
    }) => saveDraft(type, input),
    onSuccess: (_data, { type }) => {
      toast.success(t(legalDocumentToastI18nKey(LEGAL_DOCUMENT_TOAST_ACTION.SAVE_SUCCESS, type)))
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.legalDocuments() })
    },
    onError: (_error, { type }) => {
      toast.error(t(legalDocumentToastI18nKey(LEGAL_DOCUMENT_TOAST_ACTION.SAVE_ERROR, type)))
    },
  })
}

export function usePublishLegalDocument() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('admin')

  return useMutation({
    mutationFn: (type: LegalDocumentType) => publish(type),
    onSuccess: (_data, type) => {
      toast.success(t(legalDocumentToastI18nKey(LEGAL_DOCUMENT_TOAST_ACTION.PUBLISH_SUCCESS, type)))
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.legalDocuments() })
    },
    onError: (_error, type) => {
      toast.error(t(legalDocumentToastI18nKey(LEGAL_DOCUMENT_TOAST_ACTION.PUBLISH_ERROR, type)))
    },
  })
}
