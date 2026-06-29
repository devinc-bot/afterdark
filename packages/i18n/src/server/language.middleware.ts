import type { NestMiddleware } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'
import { Injectable } from '@nestjs/common'
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../config/languages.ts'
import { runWithLanguage } from './language.context.ts'
import type { Language } from '../config/languages.ts'

const LANGUAGE_COOKIE = 'afterdark_lang'

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const language = resolveLanguage(req)
    runWithLanguage(language, next)
  }
}

function resolveLanguage(req: Request): Language {
  const cookie = req.cookies?.[LANGUAGE_COOKIE]
  if (isValidLanguage(cookie)) return cookie

  const header = req.headers['accept-language']
  if (header) {
    const preferred = parseAcceptLanguage(header)
    if (isValidLanguage(preferred)) return preferred
  }

  return DEFAULT_LANGUAGE
}

function parseAcceptLanguage(header: string): string | null {
  return (
    header
      .split(',')
      .map((part) => part.trim().split(';')[0]?.trim().split('-')[0])
      .find((lang) => lang && isValidLanguage(lang)) ?? null
  )
}

function isValidLanguage(value: unknown): value is Language {
  return typeof value === 'string' && SUPPORTED_LANGUAGES.includes(value as Language)
}
