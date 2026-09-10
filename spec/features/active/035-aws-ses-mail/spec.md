# Spec 035 - AWS SES Mail Sender

## Context and Objective

Lumina already sends transactional mail through a hexagonal `MailSender` port, but the only adapter talks to Resend. The product needs to run mail on Amazon SES in `sa-east-1` so credentials, identity, and delivery stay on AWS. This change replaces the Resend adapter with SESv2 while keeping React Email templates, use cases, and call sites unchanged.

## Users / Actors

- API runtime sending transactional mail (password reset, registration verification, smoke).
- Operators configuring mail credentials and `MAIL_FROM` for development, staging, and production.
- End users who receive those emails (indirect).

## User Stories

- H1: As the API, I want to send HTML and text mail through Amazon SES so that transactional flows no longer depend on Resend.
- H2: As an operator, I want optional explicit AWS keys or the default credential chain so that local development and container IAM roles both work.
- H3: As an operator, I want deploy env examples and a short identity checklist so that `MAIL_FROM` and SES sandbox constraints are clear before smoke tests.

## Functional Requirements (EARS Acceptance Criteria)

- RF-1: WHEN a mail use case calls `MailSender.send` with `to`, `subject`, `html`, and optional `text`, THE SYSTEM SHALL deliver that message through Amazon SES v2 `SendEmail` in region `sa-east-1`.
- RF-2: THE SYSTEM SHALL keep the existing `MailSender` port, React Email templates, i18n email copy, and auth/smoke call sites unchanged except for provider wiring and configuration.
- RF-3: WHEN `MAIL_FROM` is configured and AWS credentials are available (explicit keys or default chain), THE SYSTEM SHALL treat mail as configured and allow sends.
- RF-4: IF `MAIL_FROM` is missing or empty, THEN THE SYSTEM SHALL report mail as not configured with the existing localized `NOT_CONFIGURED` error.
- RF-5: WHEN both `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set, THE SYSTEM SHALL construct the SES client with those credentials; WHEN both are empty, THE SYSTEM SHALL use the AWS default credential provider chain.
- RF-6: IF only one of the explicit AWS key env vars is set, THEN THE SYSTEM SHALL reject configuration at env validation time.
- RF-7: WHEN SES accepts the message, THE SYSTEM SHALL return `{ id }` mapped from SES `MessageId`.
- RF-8: IF SES rejects the send or returns no message id, THEN THE SYSTEM SHALL log the failure and throw the existing localized `SEND_FAILED` error.
- RF-9: THE SYSTEM SHALL remove the Resend dependency and all `RESEND_API_KEY` configuration from API env schema, test setup, and deploy env examples.
- RF-10: THE SYSTEM SHALL document that the SES sending identity for `MAIL_FROM` must be verified in `sa-east-1`, and that sandbox accounts may only send to verified recipients until production access is granted.
- RF-11: WHEN `MAIL_REPLY_TO` is configured with a non-empty trimmed value, THE SYSTEM SHALL set SES `ReplyToAddresses` to that address on every send so recipient replies go to the corporate inbox rather than the noreply From identity.
- RF-12: IF `MAIL_REPLY_TO` is empty or whitespace, THEN THE SYSTEM SHALL omit `ReplyToAddresses` from the SES send.

## Non-Functional Requirements

- Use `@aws-sdk/client-sesv2` pinned to the same major/patch style as existing `@aws-sdk/client-s3` (`3.1071.0` or the repo's current AWS SDK pin).
- Do not introduce SMTP, dual providers, or a `MAIL_PROVIDER` switch.
- Secrets: explicit AWS keys are secrets when used; `MAIL_FROM`, `MAIL_REPLY_TO`, and `MAIL_SMOKE_TO` remain non-secret runtime config; IAM role credentials must not be duplicated into env files in production.
- Provider SDKs stay behind the port/adapter boundary; use cases never import SES types.
- No new public HTTP endpoints.

## Edge Cases

- Empty `RESEND_API_KEY` replacements: empty explicit AWS keys mean default chain, not "configured = false" by themselves.
- SES sandbox: smoke and product flows fail for unverified recipients until production access or recipient verification.
- Unverified or mismatched `MAIL_FROM` identity in `sa-east-1`.
- Multi-recipient `to` arrays already allowed by the port must map to SES `ToAddresses`.
- Missing `text` body: send HTML and subject; include text when provided by templates.

## Out of Scope

- Bounce, complaint, or delivery webhook/SNS handling.
- Domain DNS automation (SPF/DKIM/DMARC setup scripts or Terraform).
- Wiring staff-invitation or welcome product flows that are not already calling mail.
- Changing React Email templates or email i18n copy.
- Changing auth callers that swallow send failures.
- Multi-region SES or configuration sets.

## Definition of Done

- SES adapter unit tests cover configured/not-configured, explicit keys vs default chain, success `MessageId` mapping, and send failure mapping.
- `mail:smoke` still works in development against a verified SES identity/recipient in `sa-east-1`.
- Resend package and env references are gone; deploy examples and tech-stack docs describe SES.
- Type-check, lint, format check, affected tests, and `git diff --check` pass.
- Spec artifacts reviewed and delegated quality review completed for the implementation.

## Open Questions

None — decisions confirmed: hard Resend removal, optional keys + default chain, code plus identity checklist, SESv2 `SendEmail`, region `sa-east-1`.
