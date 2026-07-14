const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`

export const LANDING_IMAGES = {
  hero: {
    src: unsplash('photo-1514525253161-7a46d19cd819', 2400),
    srcSet: [
      `${unsplash('photo-1514525253161-7a46d19cd819', 960)} 960w`,
      `${unsplash('photo-1514525253161-7a46d19cd819', 1600)} 1600w`,
      `${unsplash('photo-1514525253161-7a46d19cd819', 2400)} 2400w`,
    ].join(', '),
  },
  about: {
    src: unsplash('photo-1470229722913-7c0e2dbbafd3', 1600),
    srcSet: [
      `${unsplash('photo-1470229722913-7c0e2dbbafd3', 800)} 800w`,
      `${unsplash('photo-1470229722913-7c0e2dbbafd3', 1600)} 1600w`,
    ].join(', '),
  },
  nights: [
    {
      key: '1' as const,
      src: unsplash('photo-1492684223066-81342ee5ff30', 1400),
      srcSet: [
        `${unsplash('photo-1492684223066-81342ee5ff30', 700)} 700w`,
        `${unsplash('photo-1492684223066-81342ee5ff30', 1400)} 1400w`,
      ].join(', '),
    },
    {
      key: '2' as const,
      src: unsplash('photo-1540039155733-5bb30b53aa14', 1400),
      srcSet: [
        `${unsplash('photo-1540039155733-5bb30b53aa14', 700)} 700w`,
        `${unsplash('photo-1540039155733-5bb30b53aa14', 1400)} 1400w`,
      ].join(', '),
    },
    {
      key: '3' as const,
      src: unsplash('photo-1506157786151-b8491531f063', 1400),
      srcSet: [
        `${unsplash('photo-1506157786151-b8491531f063', 700)} 700w`,
        `${unsplash('photo-1506157786151-b8491531f063', 1400)} 1400w`,
      ].join(', '),
    },
  ],
} as const
