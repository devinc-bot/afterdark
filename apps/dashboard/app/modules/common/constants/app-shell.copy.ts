export const APP_SHELL_COPY = {
  brand: {
    logo: 'AFTERDARK',
    subtitle: 'Panel operativo',
  },
  nav: {
    panel: 'Panel',
    clubs: 'Clubes',
    tickets: 'Entradas',
    users: 'Usuarios',
    settings: 'Configuración',
    signOut: 'Cerrar sesión',
    usersUnavailable: 'Usuarios — próximamente disponible',
  },
  user: {
    profileLinkLabel: 'Ir a configuración de perfil',
    fallbackName: 'Usuario',
    loadingProfile: 'Cargando perfil',
  },
  session: {
    errorTitle: 'No pudimos verificar tu sesión',
    errorFallback: 'Revisá tu conexión e intentá de nuevo.',
    retry: 'Reintentar',
    loadProfileError: 'No pudimos cargar tu perfil',
  },
  signOutDialog: {
    title: 'Cerrar sesión',
    description: '¿Querés salir del panel? Vas a tener que iniciar sesión de nuevo para volver.',
    cancel: 'Cancelar',
    confirm: 'Cerrar sesión',
    signingOut: 'Cerrando sesión…',
  },
  mobileFallbackTitle: 'Panel',
  pages: {
    panel: {
      title: 'Panel',
      description: 'Resumen de operaciones del día: clubes, entradas y actividad reciente.',
    },
  },
} as const
