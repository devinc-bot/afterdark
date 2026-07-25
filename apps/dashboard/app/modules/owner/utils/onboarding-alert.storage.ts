const ONBOARDING_ALERT_DISMISSED_KEY = 'repo:dashboard:onboarding-alert:dismissed:v1'

export function readOnboardingAlertDismissed(): boolean {
  try {
    return sessionStorage.getItem(ONBOARDING_ALERT_DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

export function saveOnboardingAlertDismissed(): void {
  try {
    sessionStorage.setItem(ONBOARDING_ALERT_DISMISSED_KEY, '1')
  } catch {
    // Storage can throw in private mode, when quota is exceeded, or when disabled.
  }
}
