import { Button, Field, Input, Label } from '@afterdark/ui'
import { SETTINGS_COPY } from '~/modules/settings/constants/settings.copy'
import { SettingsSection } from '~/modules/settings/components/settings-section'
import { useSettingsForm } from '~/modules/settings/hooks/settings-form-context'

export function ProfileSettingsSection() {
  const { user, values, errors, setProfileField, setProfileAddressField } = useSettingsForm()
  const avatarSrc = user.avatar
  const avatarLabel =
    `${values.profile.name} ${values.profile.lastName}`.trim() ||
    user.email ||
    SETTINGS_COPY.profile.avatarFallback
  const addressErrors = errors.profile?.address

  return (
    <SettingsSection title={SETTINGS_COPY.sections.profile}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr] sm:gap-8">
        <div className="flex flex-col items-start gap-3">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={avatarLabel}
              className="size-16 rounded-full object-cover ring-1 ring-hairline"
            />
          ) : (
            <div
              role="img"
              aria-label={avatarLabel}
              className="flex size-16 items-center justify-center rounded-full bg-surface-container-low font-heading text-lg font-medium text-ink-muted ring-1 ring-hairline"
            >
              {avatarLabel.charAt(0).toUpperCase()}
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 min-h-11 px-2 text-ink-muted"
            disabled
            aria-describedby="settings-avatar-hint"
          >
            {SETTINGS_COPY.profile.changePhoto}
          </Button>
          <p id="settings-avatar-hint" className="max-w-44 text-sm text-ink-muted">
            {SETTINGS_COPY.profile.photoHint}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
          <Field
            label={SETTINGS_COPY.profile.name}
            htmlFor="settings-name"
            error={errors.profile?.name ?? null}
            className="col-span-3"
          >
            <Input
              id="settings-name"
              name="name"
              type="text"
              autoComplete="given-name"
              maxLength={255}
              value={values.profile.name}
              onChange={(event) => setProfileField('name', event.target.value)}
              aria-invalid={errors.profile?.name ? true : undefined}
            />
          </Field>

          <Field
            label={SETTINGS_COPY.profile.lastName}
            htmlFor="settings-last-name"
            error={errors.profile?.lastName ?? null}
            className="col-span-3"
          >
            <Input
              id="settings-last-name"
              name="lastName"
              type="text"
              autoComplete="family-name"
              maxLength={255}
              value={values.profile.lastName}
              onChange={(event) => setProfileField('lastName', event.target.value)}
              aria-invalid={errors.profile?.lastName ? true : undefined}
            />
          </Field>

          <Field
            label={SETTINGS_COPY.profile.phone}
            htmlFor="settings-phone"
            error={errors.profile?.phone ?? null}
            className="col-span-4"
          >
            <Input
              id="settings-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              maxLength={30}
              value={values.profile.phone}
              onChange={(event) => setProfileField('phone', event.target.value)}
              aria-invalid={errors.profile?.phone ? true : undefined}
            />
          </Field>

          <Field
            label={SETTINGS_COPY.profile.birthday}
            htmlFor="settings-birthday"
            error={errors.profile?.birthday ?? null}
            className="col-span-2"
          >
            <Input
              id="settings-birthday"
              name="birthday"
              type="date"
              autoComplete="bday"
              value={values.profile.birthday}
              onChange={(event) => setProfileField('birthday', event.target.value)}
              aria-invalid={errors.profile?.birthday ? true : undefined}
            />
          </Field>

          <Field
            label={SETTINGS_COPY.profile.nationalId}
            htmlFor="settings-national-id"
            error={errors.profile?.nationalId ?? null}
            className="col-span-3"
          >
            <Input
              id="settings-national-id"
              name="nationalId"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={11}
              value={values.profile.nationalId}
              onChange={(event) => setProfileField('nationalId', event.target.value)}
              aria-invalid={errors.profile?.nationalId ? true : undefined}
            />
          </Field>

          <Field
            label={SETTINGS_COPY.profile.taxId}
            htmlFor="settings-tax-id"
            error={errors.profile?.taxId ?? null}
            className="col-span-3"
          >
            <Input
              id="settings-tax-id"
              name="taxId"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={11}
              value={values.profile.taxId}
              onChange={(event) => setProfileField('taxId', event.target.value)}
              aria-invalid={errors.profile?.taxId ? true : undefined}
            />
          </Field>

          <Label variant="field" className="col-span-6 border-t border-hairline/60 pt-4">
            {SETTINGS_COPY.profile.addressSection}
          </Label>

          <Field
            label={SETTINGS_COPY.profile.address}
            htmlFor="settings-address-line"
            error={addressErrors?.address ?? null}
            className="col-span-4"
          >
            <Input
              id="settings-address-line"
              name="addressLine"
              type="text"
              autoComplete="street-address"
              maxLength={255}
              value={values.profile.address.address}
              onChange={(event) => setProfileAddressField('address', event.target.value)}
              aria-invalid={addressErrors?.address ? true : undefined}
            />
          </Field>

          <Field
            label={SETTINGS_COPY.profile.streetNumber}
            htmlFor="settings-street-number"
            error={addressErrors?.streetNumber ?? null}
            className="col-span-2"
          >
            <Input
              id="settings-street-number"
              name="streetNumber"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={20}
              value={values.profile.address.streetNumber}
              onChange={(event) => setProfileAddressField('streetNumber', event.target.value)}
              aria-invalid={addressErrors?.streetNumber ? true : undefined}
            />
          </Field>

          <Field
            label={SETTINGS_COPY.profile.city}
            htmlFor="settings-address-city"
            error={addressErrors?.city ?? null}
            className="col-span-3"
          >
            <Input
              id="settings-address-city"
              name="city"
              type="text"
              autoComplete="address-level2"
              maxLength={100}
              value={values.profile.address.city}
              onChange={(event) => setProfileAddressField('city', event.target.value)}
              aria-invalid={addressErrors?.city ? true : undefined}
            />
          </Field>

          <Field
            label={SETTINGS_COPY.profile.state}
            htmlFor="settings-address-state"
            error={addressErrors?.state ?? null}
            className="col-span-3"
          >
            <Input
              id="settings-address-state"
              name="state"
              type="text"
              autoComplete="address-level1"
              maxLength={100}
              value={values.profile.address.state}
              onChange={(event) => setProfileAddressField('state', event.target.value)}
              aria-invalid={addressErrors?.state ? true : undefined}
            />
          </Field>

          <div className="col-span-6 border-t border-hairline/60 mt-2 mb-2" />
          <Field
            label={SETTINGS_COPY.profile.email}
            htmlFor="settings-email"
            className="col-span-4"
          >
            <Input
              id="settings-email"
              name="email"
              type="email"
              autoComplete="email"
              readOnly
              value={user.email}
              aria-readonly="true"
            />
          </Field>
          <p className="col-span-6 -mt-2 text-sm text-ink-muted">
            {SETTINGS_COPY.profile.emailHint}
          </p>

          <div className="col-span-6 flex flex-col gap-2 border-t border-hairline/60 pt-4">
            <Label variant="field">{SETTINGS_COPY.profile.password}</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 min-h-11 w-fit px-2 text-ink-muted"
              disabled
              aria-describedby="settings-password-hint"
            >
              {SETTINGS_COPY.profile.changePassword}
            </Button>
            <p id="settings-password-hint" className="text-sm text-ink-muted">
              {SETTINGS_COPY.profile.passwordHint}
            </p>
          </div>
        </div>
      </div>
    </SettingsSection>
  )
}
