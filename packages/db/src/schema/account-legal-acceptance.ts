import { integer, pgTable, timestamp, unique } from 'drizzle-orm/pg-core'
import { accounts } from './account.ts'
import { createBaseColumns } from './base.ts'
import { legalDocuments } from './legal-document.ts'

export const accountLegalAcceptances = pgTable(
  'account_legal_acceptances',
  {
    ...createBaseColumns('account_legal_acceptances'),
    accountId: integer('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    legalDocumentId: integer('legal_document_id')
      .notNull()
      .references(() => legalDocuments.id, { onDelete: 'cascade' }),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('account_legal_acceptances_account_id_legal_document_id_unique').on(
      table.accountId,
      table.legalDocumentId
    ),
  ]
)

export type AccountLegalAcceptanceSelect = typeof accountLegalAcceptances.$inferSelect
export type AccountLegalAcceptanceInsert = typeof accountLegalAcceptances.$inferInsert
