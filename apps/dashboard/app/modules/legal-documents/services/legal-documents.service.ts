import { createLegalDocumentsClient } from '@repo/common'
import { i18n } from '@repo/i18n/client'
import { api } from '~/config/api'
import { DASHBOARD_ROUTES } from '../../common/constants/routes'

const client = createLegalDocumentsClient({
  api,
  legalAcceptancePath: DASHBOARD_ROUTES.legalAcceptance,
  messages: {
    unavailable: () => i18n.t('auth:register.legal.unavailable'),
    loadError: () => i18n.t('auth:legalAcceptance.loadError'),
    submitError: () => i18n.t('auth:legalAcceptance.submitError'),
  },
})

export const getPublishedLegalDocumentByType = client.getPublishedLegalDocumentByType
export const getPendingLegalAcceptance = client.getPendingLegalAcceptance
export const acceptLegalDocuments = client.acceptLegalDocuments
export const resolvePostAuthPath = client.resolvePostAuthPath
