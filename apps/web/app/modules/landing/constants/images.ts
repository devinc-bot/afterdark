function localImage(path: string) {
  return {
    src: path,
    srcSet: path,
  }
}

export const LANDING_IMAGES = {
  hero: localImage('/landing/hero.png'),
  about: localImage('/landing/about.png'),
  events: [
    {
      key: '1' as const,
      ...localImage('/landing/event-1.png'),
    },
    {
      key: '2' as const,
      ...localImage('/landing/event-2.png'),
    },
    {
      key: '3' as const,
      ...localImage('/landing/event-3.png'),
    },
  ],
} as const
