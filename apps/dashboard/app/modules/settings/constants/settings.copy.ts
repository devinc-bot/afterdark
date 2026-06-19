export const SETTINGS_COPY = {
  page: {
    title: 'Configuración',
    description: 'Administrá tu cuenta, la organización y las preferencias del panel.',
  },
  sections: {
    profile: 'Perfil',
    organization: 'Organización',
    security: 'Seguridad',
    preferences: 'Preferencias',
  },
  profile: {
    changePhoto: 'Cambiar foto',
    photoHint: 'La carga de foto estará disponible pronto.',
    name: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo electrónico',
    emailHint: 'Para cambiar el correo, escribinos a soporte.',
    password: 'Contraseña',
    changePassword: 'Cambiar contraseña',
    passwordHint: 'El cambio de contraseña estará disponible pronto.',
    avatarFallback: 'Usuario',
  },
  organization: {
    brandName: 'Nombre comercial',
    location: 'Ubicación principal',
    locationPlaceholder: 'Ciudad, país',
    localHint:
      'Estos datos se guardan en este navegador. Todavía no se sincronizan con el servidor.',
  },
  security: {
    twoFactor: 'Verificación en dos pasos',
    twoFactorDescription: 'Pedí un código extra al iniciar sesión.',
    twoFactorHint:
      'Por ahora solo guardamos tu preferencia en este navegador. La activación real llegará pronto.',
    sessions: 'Dispositivos con sesión iniciada',
    sessionsEmpty: 'No hay otras sesiones activas para mostrar.',
  },
  preferences: {
    language: 'Idioma del panel',
    languagePlaceholder: 'Elegí un idioma',
    notifications: 'Notificaciones por email',
    localHint:
      'Idioma y notificaciones se guardan en este navegador. Todavía no se sincronizan con el servidor.',
  },
  actions: {
    save: 'Guardar cambios',
    discard: 'Descartar cambios',
    retryLoad: 'Reintentar',
    dirty: 'Tenés cambios sin guardar.',
    clean: 'No hay cambios pendientes.',
  },
  messages: {
    validationSummary: 'Revisá los campos con error antes de guardar.',
    saving: 'Guardando cambios…',
    saveSuccess: 'Listo. Actualizamos tu perfil; el resto quedó guardado en este navegador.',
    saveFallback: 'No pudimos guardar los cambios. Revisá tu conexión e intentá de nuevo.',
    loadErrorTitle: 'No pudimos cargar la configuración',
    loading: 'Cargando configuración…',
  },
} as const
