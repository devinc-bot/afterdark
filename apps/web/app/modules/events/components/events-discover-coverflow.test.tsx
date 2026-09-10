// @vitest-environment jsdom
import { createElement } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import type { EventsDiscoverCoverflowSlide } from '../utils/events-discover-coverflow'

const COVERFLOW_COPY = {
  'discover.coverflow.heading': 'Featured',
  'discover.coverflow.hint': 'Tap a highlight to open it',
  'discover.coverflow.ariaLabel': 'Featured event images',
  'discover.coverflow.activateAria': '{title}. {meta}',
  'discover.coverflow.dotsAria': 'Featured slides',
  'discover.coverflow.dotAria': 'Slide {index} of {total}: {title}',
  'discover.coverflow.prev': 'Previous event',
  'discover.coverflow.next': 'Next event',
  'discover.coverflow.loading': 'Loading featured events…',
} as const

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (key: string, values?: Record<string, string | number>) => {
      const template = COVERFLOW_COPY[key as keyof typeof COVERFLOW_COPY] ?? key
      if (!values) {
        return template
      }
      return template.replace(/\{(\w+)\}/g, (_, token: string) => String(values[token] ?? ''))
    },
  }),
}))

import { EventsDiscoverCoverflow } from './events-discover-coverflow'

type CoverflowUnderTestProps = {
  slides: EventsDiscoverCoverflowSlide[]
  onActivate: (slug: string) => void
  isLoading?: boolean
  className?: string
}

const sampleSlide: EventsDiscoverCoverflowSlide = {
  slug: 'neon-nights',
  src: 'https://cdn.example.test/neon.jpg',
  title: 'Neon Nights',
  when: 'Fri 20:00',
  place: 'Buenos Aires',
}

function renderCoverflow(props: CoverflowUnderTestProps) {
  return render(createElement(EventsDiscoverCoverflow, props as never))
}

function stubMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

function stubObservers() {
  class ObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ObserverStub,
  })
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: ObserverStub,
  })
}

beforeEach(() => {
  stubMatchMedia(false)
  stubObservers()
})

afterEach(() => {
  cleanup()
})

test('shows an accessible coverflow skeleton while isLoading is true', () => {
  renderCoverflow({
    slides: [],
    onActivate: vi.fn(),
    isLoading: true,
  })

  const busy = document.querySelector('[aria-busy="true"]')
  expect(busy).toBeTruthy()
  expect(busy?.getAttribute('aria-busy')).toBe('true')

  expect(screen.getByRole('heading', { name: 'Featured' })).toBeTruthy()
  expect(screen.getByText('Loading featured events…')).toBeTruthy()
  expect(screen.getByText('Loading featured events…').className).toContain('sr-only')
  expect(screen.getByText('Loading featured events…').getAttribute('role')).toBe('status')

  const slideSkeleton = document.querySelector('.aspect-19\\/9, [class*="aspect-19/9"]')
  expect(slideSkeleton).toBeTruthy()

  expect(screen.queryByRole('button', { name: /Neon Nights/i })).toBeNull()
})

test('renders the real coverflow when not loading and slides exist', () => {
  renderCoverflow({
    slides: [sampleSlide],
    onActivate: vi.fn(),
    isLoading: false,
  })

  expect(screen.getByRole('heading', { name: 'Featured' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Neon Nights. Fri 20:00 · Buenos Aires' })).toBeTruthy()
  expect(screen.queryByText('Loading featured events…')).toBeNull()
  expect(document.querySelector('[aria-busy="true"]')).toBeNull()
})

test('returns null when not loading and there are no slides', () => {
  const { container } = renderCoverflow({
    slides: [],
    onActivate: vi.fn(),
    isLoading: false,
  })

  expect(container.firstChild).toBeNull()
  expect(screen.queryByText('Loading featured events…')).toBeNull()
  expect(document.querySelector('[aria-busy="true"]')).toBeNull()
})

test('does not show the skeleton after load when slides stay empty (isLoading omitted)', () => {
  const { container } = renderCoverflow({
    slides: [],
    onActivate: vi.fn(),
  })

  expect(container.firstChild).toBeNull()
  expect(screen.queryByText('Loading featured events…')).toBeNull()
})
