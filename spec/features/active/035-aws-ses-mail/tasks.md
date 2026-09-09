# Tasks 035 - AWS SES Mail Sender

- [x] T1: Replace `mailEnvSchema` / test setup / deploy env examples: drop `RESEND_API_KEY`, add `AWS_REGION` plus optional paired AWS keys; update `MailConfigService` and secrets docs; add focused env/config tests.
- [x] T2: Add `@aws-sdk/client-sesv2`, implement `SesMailSender`, wire `MAIL_SENDER`, remove Resend adapter and dependency; add focused adapter unit tests.
- [x] T3: Update `spec/constitution/tech-stack.md` and deploy README with SES `sa-east-1` identity/sandbox operator checklist.
- [x] T4: Run affected tests, type-check, lint, format check, and `git diff --check`; smoke-send when SES identity is available; complete delegated acceptance and quality review.
- [x] T5: Add optional `MAIL_REPLY_TO` env and map non-empty values to SES `ReplyToAddresses`; update tests, deploy examples, and docs.
