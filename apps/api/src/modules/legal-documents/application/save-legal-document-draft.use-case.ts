import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import {
  findLatestPublishedLegalDocumentByType,
  findLegalDocumentDraftByType,
  upsertLegalDocumentDraft,
} from '@repo/db'
import { LEGAL_DOCUMENT_ERROR_CODE } from '@repo/i18n'
import { TranslationService } from '@repo/i18n/server'
import type { LegalDocumentResponse, LegalDocumentType } from '@repo/types'
import type { SaveLegalDocumentDraftInput } from '@repo/validators'
import { toLegalDocumentResponse } from './legal-document.mapper'

const PUBLISHED_VERSION_PATTERN = /^v(\d+)$/

function nextDraftVersion(publishedVersion: string | undefined): string {
  if (!publishedVersion) return 'v1'
  const match = PUBLISHED_VERSION_PATTERN.exec(publishedVersion)
  if (!match) return 'v1'
  return `v${Number(match[1]) + 1}`
}

@Injectable()
export class SaveLegalDocumentDraftUseCase {
  constructor(@Inject(TranslationService) private readonly ts: TranslationService) {}

  async execute(
    type: LegalDocumentType,
    input: SaveLegalDocumentDraftInput
  ): Promise<LegalDocumentResponse> {
    try {
      const existingDraft = await findLegalDocumentDraftByType(type)
      const version = existingDraft
        ? existingDraft.version
        : nextDraftVersion((await findLatestPublishedLegalDocumentByType(type))?.version)

      const row = await upsertLegalDocumentDraft({
        type,
        title: input.title,
        content: input.content,
        requiresAcceptance: input.requiresAcceptance,
        version,
      })

      return toLegalDocumentResponse(row)
    } catch {
      throw new InternalServerErrorException(
        this.ts.translateError(LEGAL_DOCUMENT_ERROR_CODE.SAVE_FAILED)
      )
    }
  }
}
