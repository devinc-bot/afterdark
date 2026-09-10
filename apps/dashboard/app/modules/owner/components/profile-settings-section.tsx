import { useTranslation } from 'react-i18next'
import { Camera, Trash2 } from 'lucide-react'
import { ALLOWED_IMAGE_MIME_TYPES } from '@repo/validators'
import {
  Avatar,
  AvatarCropDialog,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Input,
  Label,
} from '@repo/ui'
import { FormSection } from '~/modules/common/components/form-section'
import { getUserInitials } from '~/modules/common/utils/app-shell-user.utils'
import { useSettingsForm } from '~/modules/owner/hooks/settings-form-context'
import { useProfileAvatar } from '~/modules/owner/hooks/use-profile-avatar'
import { EmailChangeSupportHint } from '~/modules/settings/components/email-change-support-hint'

export function ProfileSettingsSection() {
  const { t } = useTranslation('settings')
  const { user, values, errors, setProfileField, setNestedProfileField } = useSettingsForm()
  const {
    fileInputRef,
    cropImageSrc,
    removeDialogOpen,
    setRemoveDialogOpen,
    closeCrop,
    isAvatarBusy,
    isUploading,
    isRemoving,
    handleAvatarSelection,
    handleAvatarConfirm,
    handleAvatarRemove,
  } = useProfileAvatar()
  const avatarSrc = user.avatar
  const avatarLabel =
    `${values.profile.name} ${values.profile.lastName}`.trim() ||
    user.email ||
    t('owner.profile.avatarFallback')
  const avatarInitials = getUserInitials(values.profile.name, values.profile.lastName)
  const avatarFallback =
    avatarInitials === '?' ? avatarLabel.slice(0, 1).toLocaleUpperCase('es-AR') : avatarInitials

  return (
    <>
      <FormSection
        id="owner-profile"
        title={t('owner.sections.profile')}
        description={t('owner.sections.profileDescription')}
      >
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="size-16 shrink-0 ring-1 ring-hairline transition-[ring-color] duration-(--duration-fast) ease-emphasized hover:ring-primary/40 motion-reduce:transition-none">
            <AvatarImage src={avatarSrc ?? undefined} alt={avatarLabel} className="object-cover" />
            <AvatarFallback className="bg-surface-container-low font-heading text-lg font-medium text-ink-muted">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_MIME_TYPES.join(',')}
              className="sr-only"
              onChange={(event) => void handleAvatarSelection(event)}
              disabled={isAvatarBusy}
              tabIndex={-1}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              iconLeft={<Camera aria-hidden="true" />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isAvatarBusy}
            >
              {t('owner.profile.changePhoto')}
            </Button>
            {avatarSrc ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hover:text-destructive hover:bg-destructive/10"
                iconLeft={<Trash2 aria-hidden="true" />}
                onClick={() => setRemoveDialogOpen(true)}
                disabled={isAvatarBusy}
              >
                {t('owner.profile.removePhoto')}
              </Button>
            ) : null}
          </div>
        </div>

        {cropImageSrc ? (
          <AvatarCropDialog
            open
            imageSrc={cropImageSrc}
            onOpenChange={(open) => {
              if (!open) {
                closeCrop()
              }
            }}
            onConfirm={handleAvatarConfirm}
            onCancel={closeCrop}
            isConfirming={isUploading}
            labels={{
              title: t('owner.profile.cropTitle'),
              description: t('owner.profile.cropDescription'),
              confirm: isUploading ? t('owner.profile.uploading') : t('owner.profile.cropConfirm'),
              cancel: t('owner.profile.cropCancel'),
              zoom: t('owner.profile.cropZoom'),
              cropArea: t('owner.profile.cropArea'),
              cropError: t('owner.profile.cropError'),
            }}
          />
        ) : null}

        <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <DialogContent
            size="sm"
            variant="destructive"
            persistent={isRemoving}
            closeLabel={t('owner.profile.cropCancel')}
          >
            <DialogHeader>
              <DialogTitle>{t('owner.profile.removePhoto')}</DialogTitle>
              <DialogDescription>{t('owner.profile.removeConfirm')}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => setRemoveDialogOpen(false)}
                disabled={isRemoving}
              >
                {t('owner.profile.cropCancel')}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="min-h-11"
                onClick={() => void handleAvatarRemove()}
                loading={isRemoving}
              >
                {isRemoving ? t('owner.profile.removing') : t('owner.profile.removePhoto')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
          <Field
            label={t('owner.profile.name')}
            htmlFor="settings-name"
            error={errors.profile?.name ?? null}
            className="sm:col-span-3"
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
            label={t('owner.profile.lastName')}
            htmlFor="settings-last-name"
            error={errors.profile?.lastName ?? null}
            className="sm:col-span-3"
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
            label={t('owner.profile.phone')}
            htmlFor="settings-phone"
            error={errors.profile?.phone ?? null}
            className="sm:col-span-4"
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
            label={t('owner.profile.birthday')}
            htmlFor="settings-birthday"
            error={errors.profile?.birthday ?? null}
            className="sm:col-span-2"
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
            label={t('owner.profile.nationalId')}
            htmlFor="settings-national-id"
            error={errors.profile?.nationalId ?? null}
            className="sm:col-span-3"
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
        </div>
      </FormSection>

      <FormSection
        id="owner-address"
        title={t('owner.sections.address')}
        description={t('owner.sections.addressDescription')}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
          <Field
            label={t('owner.profile.address')}
            htmlFor="settings-address"
            error={errors.profile?.address ?? null}
            className="sm:col-span-4"
          >
            <Input
              id="settings-address"
              name="address"
              type="text"
              autoComplete="address-line1"
              maxLength={255}
              value={values.profile.address.address}
              onChange={(event) => setNestedProfileField('address', 'address', event.target.value)}
              aria-invalid={errors.profile?.address ? true : undefined}
            />
          </Field>

          <Field
            label={t('owner.profile.streetNumber')}
            htmlFor="settings-street-number"
            className="sm:col-span-2"
          >
            <Input
              id="settings-street-number"
              name="streetNumber"
              type="text"
              maxLength={20}
              value={values.profile.address.streetNumber}
              onChange={(event) =>
                setNestedProfileField('address', 'streetNumber', event.target.value)
              }
            />
          </Field>

          <Field
            label={t('owner.profile.state')}
            htmlFor="settings-state"
            className="sm:col-span-3"
          >
            <Input
              id="settings-state"
              name="state"
              type="text"
              autoComplete="address-level1"
              maxLength={100}
              value={values.profile.address.state}
              onChange={(event) => setNestedProfileField('address', 'state', event.target.value)}
            />
          </Field>

          <Field label={t('owner.profile.city')} htmlFor="settings-city" className="sm:col-span-3">
            <Input
              id="settings-city"
              name="city"
              type="text"
              autoComplete="address-level2"
              maxLength={100}
              value={values.profile.address.city}
              onChange={(event) => setNestedProfileField('address', 'city', event.target.value)}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        id="owner-account"
        title={t('owner.sections.account')}
        description={t('owner.sections.accountDescription')}
      >
        <Field label={t('owner.profile.email')} htmlFor="settings-email">
          <Input
            id="settings-email"
            name="email"
            type="email"
            autoComplete="email"
            readOnly
            value={user.email}
            aria-readonly="true"
          />
          <EmailChangeSupportHint
            hintKey="owner.profile.emailHint"
            subjectKey="owner.profile.emailSupportSubject"
          />
        </Field>

        <div className="flex flex-col items-start gap-1">
          <Label variant="field">{t('owner.profile.password')}</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 min-h-11 px-2 text-ink-muted"
            disabled
            aria-describedby="settings-password-hint"
          >
            {t('owner.profile.changePassword')}
          </Button>
          <p id="settings-password-hint" className="text-sm text-ink-muted">
            {t('owner.profile.passwordHint')}
          </p>
        </div>
      </FormSection>
    </>
  )
}
