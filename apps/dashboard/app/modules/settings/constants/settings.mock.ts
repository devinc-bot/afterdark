export const RECENT_SESSIONS = [
  { id: 'macos', device: 'Mac · Chrome', ip: '192.168.1.1' },
  { id: 'iphone', device: 'iPhone · app móvil', ip: '45.2.19.88' },
] as const

export const NOTIFICATION_OPTIONS = [
  {
    id: 'ticket-sales',
    label: 'Ventas de entradas',
    description: 'Te avisamos cuando se confirma una venta.',
    defaultChecked: true,
  },
  {
    id: 'inventory',
    label: 'Stock bajo',
    description: 'Te avisamos cuando un producto queda con poco stock.',
    defaultChecked: true,
  },
  {
    id: 'registration',
    label: 'Nuevos registros',
    description: 'Recibís un resumen diario de altas.',
    defaultChecked: false,
  },
  {
    id: 'security-log',
    label: 'Actividad de la cuenta',
    description: 'Recibís un resumen semanal de inicios de sesión.',
    defaultChecked: true,
  },
] as const

export const LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
] as const
