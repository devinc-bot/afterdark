import { describe, expect, test } from 'vitest'
import { API_ROUTES, buildApiPath } from '../src/config/api-routes.ts'

type SettingsAvatarPath = {
  avatar?: () => string
}

const settingsPath = API_ROUTES.settings.path as SettingsAvatarPath

describe('settings avatar routes', () => {
  test('shares one /avatar path for upload and remove methods', () => {
    expect(settingsPath.avatar).toBeTypeOf('function')
    expect(settingsPath.avatar?.()).toBe('/avatar')
  })

  test('builds the settings avatar API path', () => {
    expect(settingsPath.avatar).toBeTypeOf('function')

    const avatarPath = settingsPath.avatar?.()

    expect(avatarPath).toBeDefined()
    expect(buildApiPath(API_ROUTES.settings, avatarPath ?? '')).toBe('/api/settings/avatar')
  })
})
