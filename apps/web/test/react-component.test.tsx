// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

function HelloWorld() {
  return <h1>Hello Vitest</h1>
}

afterEach(() => {
  cleanup()
})

test('renders a heading inside the scoped jsdom environment', () => {
  render(<HelloWorld />)
  expect(screen.getByRole('heading', { name: 'Hello Vitest' })).toBeTruthy()
  expect(typeof document).toBe('object')
})
