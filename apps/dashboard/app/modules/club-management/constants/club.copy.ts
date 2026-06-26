export const CLUB_COPY = {
  formPage: {
    back: 'Volver a clubes',
    cancel: 'Cancelar',
    createTitle: 'Añadir nuevo club',
    createDescription: 'Completá los datos para registrar un club en la plataforma.',
    editTitle: 'Editar club',
    editDescription: 'Actualizá la información del club. Los cambios se reflejan de inmediato.',
    submitCreate: 'Registrar club',
    submitCreatePending: 'Registrando…',
    submitEdit: 'Actualizar club',
    submitEditPending: 'Actualizando…',
    toastCreateSuccess: 'Club registrado correctamente',
    toastEditSuccess: 'Club actualizado correctamente',
    toastCreateError: 'No pudimos registrar el club. Intentá de nuevo.',
    toastEditError: 'No pudimos actualizar el club. Intentá de nuevo.',
    toastMissingClubId: 'No pudimos identificar el club a actualizar.',
  },
  sections: {
    generalTitle: 'Información general',
    generalDescription: 'Datos básicos del club que verán los usuarios en la plataforma.',
    imagesTitle: 'Imágenes',
    imagesDescription:
      'Fotos del local que se mostrarán en la plataforma. Podés subir hasta 5 imágenes.',
    locationTitle: 'Ubicación',
    locationDescription: 'Dirección física del local para operaciones y referencias internas.',
  },
  unsaved: {
    title: '¿Salir sin guardar?',
    description: 'Tenés cambios sin guardar. Si salís ahora, se perderán.',
    stay: 'Seguir editando',
    leave: 'Salir sin guardar',
  },
  notFound: {
    title: 'No encontramos el club que querés editar.',
    description: 'El club no existe o no tenés permiso para editarlo.',
  },
} as const
