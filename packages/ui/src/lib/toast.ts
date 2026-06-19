import { sileo, type SileoOptions, type SileoPosition } from 'sileo'

export type ToastOptions = {
  description?: string
  id?: string
  position?: SileoPosition
  duration?: number | null
}

export type ToastPromiseOptions<T = unknown> = Parameters<typeof sileo.promise<T>>[1]

function toSileoOptions(title: string, options?: ToastOptions): SileoOptions {
  if (options?.id) {
    sileo.dismiss(options.id)
  }

  return {
    title,
    description: options?.description,
    position: options?.position,
    duration: options?.duration,
  }
}

export const toast = {
  success(title: string, options?: ToastOptions) {
    return sileo.success(toSileoOptions(title, options))
  },
  error(title: string, options?: ToastOptions) {
    return sileo.error(toSileoOptions(title, options))
  },
  info(title: string, options?: ToastOptions) {
    return sileo.info(toSileoOptions(title, options))
  },
  warning(title: string, options?: ToastOptions) {
    return sileo.warning(toSileoOptions(title, options))
  },
  loading(title: string, options?: ToastOptions) {
    return sileo.show({ ...toSileoOptions(title, options), type: 'loading' })
  },
  promise<T>(promise: Promise<T> | (() => Promise<T>), options: ToastPromiseOptions<T>) {
    return sileo.promise(promise, options)
  },
  dismiss: sileo.dismiss,
  clear: sileo.clear,
}

export { sileo }
export type { SileoOptions, SileoPosition }
