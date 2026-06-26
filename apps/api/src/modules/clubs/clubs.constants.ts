import { CLUB_IMAGE_MAX_COUNT } from '@afterdark/validators'

export const CLUB_MESSAGE = {
  CREATE_FAILED: 'No pudimos crear el club. Intentá de nuevo en unos minutos.',
  IMAGE_UPLOAD_FAILED:
    'No pudimos guardar las imágenes del club. Intentá de nuevo en unos minutos.',
  TOO_MANY_IMAGES: `Podés subir hasta ${CLUB_IMAGE_MAX_COUNT} imágenes por club.`,
  INVALID_IMAGE_IDS: 'Una o más imágenes seleccionadas no pertenecen a este club.',
  OWNER_NOT_FOUND: 'Usuario no encontrado',
  UPDATE_FAILED: 'No pudimos actualizar el club. Intentá de nuevo en unos minutos.',
  DELETE_FAILED: 'No pudimos eliminar el club. Intentá de nuevo en unos minutos.',
  NOT_FOUND: 'No encontramos el club solicitado.',
} as const
