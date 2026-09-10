function localImage(path: string) {
  return {
    src: path,
    srcSet: path,
  }
}

export const LANDING_IMAGES = {
  hero: localImage('/landing/hero.png'),
  audiences: localImage('/landing/audiences.jpg'),
  value: localImage('/landing/value.jpg'),
  demoPoster: localImage('/landing/owner-promo-poster.jpg'),
} as const
