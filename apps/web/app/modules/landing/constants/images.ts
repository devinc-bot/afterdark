const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`

function imageSet(id: string, widths: number[]) {
  return {
    src: unsplash(id, widths[widths.length - 1]),
    srcSet: widths.map((width) => `${unsplash(id, width)} ${width}w`).join(', '),
  }
}

export const LANDING_IMAGES = {
  hero: imageSet('photo-1514525253161-7a46d19cd819', [960, 1600, 2400]),
  about: imageSet('photo-1470229722913-7c0e2dbbafd3', [800, 1600]),
  atmosphere: imageSet('photo-1516450360452-9312f5e86fc7', [960, 1600, 2400]),
  clarity: imageSet('photo-1429962714451-bb934ecdc4ec', [800, 1400]),
  events: [
    {
      key: '1' as const,
      ...imageSet('photo-1492684223066-81342ee5ff30', [700, 1400]),
    },
    {
      key: '2' as const,
      ...imageSet('photo-1540039155733-5bb30b53aa14', [700, 1400]),
    },
    {
      key: '3' as const,
      ...imageSet('photo-1506157786151-b8491531f063', [700, 1400]),
    },
  ],
} as const
