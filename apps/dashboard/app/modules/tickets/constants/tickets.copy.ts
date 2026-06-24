export const TICKETS_COPY = {
  page: {
    title: 'Gestión de tickets',
    description:
      'Administrá los tipos de entrada, precios, disponibilidad y estado de venta por club.',
    metaTitle: 'Gestión de tickets · afterdark Admin',
  },
  tabs: {
    active: 'Activos',
    archived: 'Archivados',
  },
  table: {
    title: 'Detalle del inventario de tickets',
    registryCount: (count: number) =>
      count === 1 ? '1 ticket registrado' : `${count} tickets registrados`,
    club: 'Club nocturno',
    ticketType: 'Tipo de entrada',
    price: 'Precio',
    stockStatus: 'Estado de stock',
    totalSold: 'Total vendido',
    revenue: 'Ingresos',
    actions: 'Acciones',
    emptyActiveTitle: 'No hay tickets activos',
    emptyActiveDescription:
      'Los tickets activos aparecerán acá cuando estén publicados para la venta.',
    emptyArchivedTitle: 'No hay tickets archivados',
    emptyArchivedDescription:
      'Los tickets archivados aparecerán acá cuando desactives una entrada.',
  },
} as const
