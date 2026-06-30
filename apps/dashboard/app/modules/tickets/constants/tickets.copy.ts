export const TICKETS_COPY = {
  page: {
    title: 'Gestión de tickets',
    description:
      'Administrá los tipos de entrada, precios, disponibilidad y estado de venta por club.',
    metaTitle: 'Gestión de tickets · afterdark Admin',
  },
  tabs: {
    active: 'Activos',
    inactive: 'Inactivos',
  },
  table: {
    title: 'Detalle del inventario de tickets',
    registryCount: (count: number) =>
      count === 1 ? '1 ticket registrado' : `${count} tickets registrados`,
    club: 'Club nocturno',
    ticketType: 'Tipo de entrada',
    price: 'Precio',
    quantity: 'Cantidad de tickets',
    totalSold: 'Total vendido',
    revenue: 'Ingresos',
    actions: 'Acciones',
    emptyActiveTitle: 'No hay tickets activos',
    emptyActiveDescription:
      'Los tickets activos aparecerán acá cuando estén publicados para la venta.',
    emptyInactiveTitle: 'No hay tickets inactivos',
    emptyInactiveDescription: 'Los tickets inactivos aparecerán acá cuando desactives una entrada.',
  },
} as const
