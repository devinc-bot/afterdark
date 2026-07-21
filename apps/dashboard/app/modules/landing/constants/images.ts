const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`

function imageSet(id: string, widths: number[]) {
  return {
    src: unsplash(id, widths[widths.length - 1]),
    srcSet: widths.map((width) => `${unsplash(id, width)} ${width}w`).join(', '),
  }
}

export const LANDING_IMAGES = {
  audiences: imageSet('photo-1492684223066-81342ee5ff30', [800, 1400]),
  value: imageSet('photo-1429962714451-bb934ecdc4ec', [800, 1400]),
} as const
