function localImage(path: string) {
  return {
    src: path,
    srcSet: path,
  }
}

export const LANDING_IMAGES = {
  hero: localImage('/landing/hero.png'),
  about: localImage('/landing/about.png'),
} as const
