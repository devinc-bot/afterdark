# Plan 035 - AWS SES Mail Sender

## Approach

Keep the existing mail hexagonal slice. Replace only the outbound adapter and configuration surface: add `SesMailSender` implementing `MailSender`, wire it in `MailModule`, rewrite `mailEnvSchema` / `MailConfigService`, remove `resend`, and update deploy/docs. Templates, use cases, and auth call sites stay as-is.

## Confirmed Decisions

- Hard cutover: remove Resend; no dual-provider switch.
- Credentials: optional `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`; if both empty, use default credential chain (IAM role / shared config).
- Scope: API adapter + env/docs + short SES identity/sandbox checklist. No bounce/SNS work.
- API: `@aws-sdk/client-sesv2` `SendEmailCommand` with Simple HTML + Text content.
- Region: `sa-east-1` via required `AWS_REGION` (documented default/value for all envs).

## Configuration

Replace `mailEnvSchema` fields:

| Var                     | Role                                              |
| ----------------------- | ------------------------------------------------- |
| `AWS_REGION`            | SES region; required; operators set `sa-east-1`   |
| `AWS_ACCESS_KEY_ID`     | Optional; empty with secret empty → default chain |
| `AWS_SECRET_ACCESS_KEY` | Optional; must be paired with access key id       |
| `MAIL_FROM`             | Verified SES From identity (unchanged semantics)  |
| `MAIL_REPLY_TO`         | Optional Reply-To (corporate inbox); empty → omit |
| `MAIL_SMOKE_TO`         | Smoke recipient (unchanged)                       |

Validation rules:

- Reject when exactly one of the two AWS key vars is non-empty.
- `MailConfigService.isConfigured()` = non-empty `MAIL_FROM` (credentials resolved at send time via SDK).
- Update `test/setup.ts`, `deploy/env/*.runtime.env.example`, and `deploy/env/README.md` (secrets list: drop `RESEND_API_KEY`; document optional AWS keys as secrets when used).
- Update `spec/constitution/tech-stack.md` mail section; correct the stale `packages/validators/src/mail.ts` reference (mail env lives in `apps/api/src/config/env.schema.ts`).

## Adapter

1. Add `apps/api/src/modules/mail/adapters/ses.mail-sender.ts`.
2. Construct `SESv2Client({ region: ENV.AWS_REGION, credentials?: { accessKeyId, secretAccessKey } })`.
3. Map `SendMailInput` → `SendEmailCommand`:
   - `FromEmailAddress`: `ENV.MAIL_FROM`
   - `ReplyToAddresses`: `[trimmed MAIL_REPLY_TO]` when non-empty; otherwise omit
   - `Destination.ToAddresses`: normalize `to` to `string[]`
   - `Content.Simple.Subject` / `Body.Html` / optional `Body.Text` with UTF-8 charset
4. Return `{ id: response.MessageId }`; on error or missing id, log and throw `SEND_FAILED`.
5. Wire `MAIL_SENDER` → `SesMailSender` in `mail.module.ts`.
6. Delete `adapters/resend.mail-sender.ts` and remove `resend` from `apps/api/package.json`.
7. Pin `@aws-sdk/client-sesv2` to the same version family as existing `@aws-sdk/client-s3`.

## Unchanged Surfaces

- `MailSender` port and `SendMailInput` / `SendMailResult`.
- `MailTemplatesService`, React Email templates, i18n `emails` namespace.
- `Send*UseCase` orchestration and auth registration/password-reset callers.
- Smoke script entrypoint (`mail:smoke`); only provider behind it changes.

## Operator Checklist (docs only)

Document in deploy/env README (short bullets):

1. In SES console (`sa-east-1`), verify the domain or email used by `MAIL_FROM`.
2. Until production access is approved, verify each smoke/test recipient (or leave sandbox).
3. Prefer IAM task/instance role in deployed environments; use explicit keys only for local/dev when needed.
4. Run `pnpm --filter @repo/api mail:smoke` after env is set.

## Verification

- Unit-test `SesMailSender` with a mocked `SESv2Client` / command send:
  - success returns SES `MessageId`
  - SES error → `SEND_FAILED`
  - missing `MAIL_FROM` → `NOT_CONFIGURED` path via config or adapter
  - credentials object present only when both keys set
- Unit-test env schema pairing rule for AWS keys.
- Update any tests that stub `RESEND_API_KEY`.
- Run affected API tests, `pnpm type-check`, `pnpm lint`, `pnpm format:check`, `git diff --check`.
- Manual smoke against SES in `sa-east-1` when credentials/identity are available.

## Risks

- SES sandbox blocks arbitrary recipients used by password-reset and registration flows.
- Default credential chain failures surface only at send time; keep clear logging.
- Region mismatch: identity verified in another region will fail if `AWS_REGION` is `sa-east-1`.
