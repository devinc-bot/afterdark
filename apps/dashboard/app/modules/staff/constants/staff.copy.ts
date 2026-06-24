export const STAFF_COPY = {
  page: {
    title: 'Gestión de personal',
    description:
      'Administrá permisos del equipo y el acceso al control de entradas en los clubes activos.',
    metaTitle: 'Gestión de personal · afterdark Admin',
  },
  form: {
    title: 'Invitar personal del equipo',
    description:
      'Ingresá el correo y el club. Podés agregar una palabra de seguridad opcional que ambos deberán conocer.',
    trigger: 'Invitar personal',
    cancel: 'Cancelar',
    email: 'Correo electrónico',
    emailPlaceholder: 'juan@afterdark.com',
    club: 'Club asignado',
    clubPlaceholder: 'Seleccioná un club…',
    clubLoading: 'Cargando clubes…',
    clubEmpty: 'No tenés clubes registrados',
    clubsLoadError: 'No pudimos cargar tus clubes. Intentá de nuevo.',
    securityWord: 'Palabra de seguridad (opcional)',
    securityWordPlaceholder: 'Ej. afterdark-2026',
    securityWordHint:
      'Si la configurás, el invitado deberá ingresarla al activar su cuenta, además de su contraseña.',
    submit: 'Generar enlace',
    submitting: 'Generando…',
    success: 'Invitación de personal creada correctamente',
    error: 'No pudimos generar la invitación. Intentá de nuevo.',
  },
  invitation: {
    successTitle: 'Enlace de invitación listo',
    successDescription:
      'Compartí este enlace con la persona invitada al personal. Vence en 5 minutos.',
    securityWordNote: 'Compartí la palabra de seguridad por un canal distinto al enlace.',
    linkLabel: 'Enlace de acceso',
    copy: 'Copiar enlace',
    copied: 'Enlace copiado',
    expiresIn: (time: string) => `Vence en ${time}`,
    expired: 'Este enlace ya venció',
    close: 'Cerrar',
    pending: 'Invitación pendiente',
    accept: {
      metaTitle: 'Activar acceso · afterdark Admin',
      title: 'Activá tu acceso',
      description:
        'Completá el formulario con tu contraseña de cuenta y la palabra de seguridad que acordaste, si corresponde.',
      invitedAs: 'Correo invitado',
      clubLabel: 'Club asignado',
      securityWord: 'Palabra de seguridad',
      securityWordPlaceholder: 'La que acordaste con tu administrador',
      securityWordWrong: 'La palabra de seguridad no es correcta.',
      password: 'Contraseña de cuenta',
      passwordPlaceholder: '••••••••',
      confirmPassword: 'Confirmar contraseña',
      confirmPasswordPlaceholder: '••••••••',
      submit: 'Activar acceso',
      submitting: 'Activando…',
      success: 'Acceso activado. Ya podés iniciar sesión.',
      invalidTitle: 'Invitación no válida',
      invalidDescription: 'El enlace está incompleto o fue modificado.',
      expiredTitle: 'Invitación vencida',
      expiredDescription:
        'Este enlace ya no está disponible. Pedile a tu administrador que genere uno nuevo.',
      slugMismatchTitle: 'Enlace incorrecto',
      slugMismatchDescription: 'La URL no coincide con la invitación. Verificá el enlace recibido.',
      goToLogin: 'Ir a iniciar sesión',
    },
  },
  kpi: {
    totalStaff: 'Equipo total',
    staffSummary: (activeCount: number, totalCount: number) => {
      const inactiveCount = totalCount - activeCount
      const activeLabel =
        activeCount === 1 ? '1 activo' : `${activeCount.toLocaleString('es-AR')} activos`
      if (inactiveCount === 0) return activeLabel
      const inactiveLabel =
        inactiveCount === 1 ? '1 inactivo' : `${inactiveCount.toLocaleString('es-AR')} inactivos`
      return `${activeLabel} · ${inactiveLabel}`
    },
    ariaLabel: 'Indicadores del equipo operativo',
  },
  deactivate: {
    title: 'Desactivar acceso',
    descriptionPrefix: '¿Querés desactivar el acceso de',
    descriptionSuffix:
      '? No podrá ingresar al control de entradas ni a la gestión de barra hasta que lo reactives.',
    cancel: 'Cancelar',
    confirm: 'Desactivar acceso',
  },
  table: {
    title: 'Registro del equipo',
    name: 'Nombre',
    venue: 'Club',
    role: 'Rol',
    lastActive: 'Última actividad',
    status: 'Estado',
    actions: 'Acciones',
    edit: 'Editar usuario',
    registryCount: (total: number) =>
      total === 1
        ? '1 usuario en el registro'
        : `${total.toLocaleString('es-AR')} usuarios en el registro`,
    showingFiltered: (visible: number, total: number) =>
      `Mostrando ${visible.toLocaleString('es-AR')} de ${total.toLocaleString('es-AR')} usuarios`,
    search: {
      label: 'Buscar en el registro',
      placeholder: 'Buscar por nombre o correo…',
      clear: 'Limpiar búsqueda',
    },
    noResultsTitle: 'Ningún usuario coincide',
    noResultsDescription: 'Probá con otro nombre o correo electrónico.',
    emptyTitle: 'Todavía no hay usuarios',
    emptyDescription: 'Creá el primer usuario para empezar a asignar accesos operativos por club.',
    editUnavailableTooltip: 'La edición estará disponible pronto.',
    offline: 'Sin conexión',
    justCreated: 'Recién creado',
    justActivated: 'Recién activado',
    editUnavailable: 'La edición estará disponible pronto.',
    activateAccess: 'Activar acceso de',
    deactivateAccess: 'Desactivar acceso de',
    statusActive: 'Activo',
    statusInactive: 'Inactivo',
  },
  roles: {
    controller: 'Control de entradas',
    drinkManager: 'Gestión de barra',
  },
  userRoles: {
    user: 'Usuario',
    admin: 'Administrador',
    owner: 'Propietario',
    staff: 'Personal',
  },
  tabs: {
    staff: 'Personal',
    invitations: 'Invitaciones',
  },
  invitationsTable: {
    title: 'Invitaciones enviadas',
    email: 'Correo',
    venue: 'Club',
    security: 'Seguridad',
    expires: 'Vencimiento',
    status: 'Estado',
    actions: 'Acciones',
    registryCount: (total: number) =>
      total === 1 ? '1 invitación creada' : `${total.toLocaleString('es-AR')} invitaciones creadas`,
    securityEnabled: 'Con palabra',
    securityDisabled: 'Sin palabra',
    statusPending: 'Pendiente',
    statusExpired: 'Vencida',
    copyLink: 'Copiar enlace',
    emptyTitle: 'Todavía no hay invitaciones',
    emptyDescription: 'Generá un enlace de invitación para sumar personal al equipo de un club.',
  },
} as const
