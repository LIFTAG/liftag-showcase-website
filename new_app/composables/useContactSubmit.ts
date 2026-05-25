export type ContactSubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

export interface ContactSubmitBody {
  name: string
  email: string
  subject: string
  message: string
  turnstileToken: string
}

interface FetchError {
  response?: { status?: number, headers?: Headers }
  status?: number
  statusCode?: number
}

function parseRetryAfter(value: string | null | undefined): string | null {
  if (!value) return null
  const seconds = Number(value)
  if (!Number.isFinite(seconds) || seconds <= 0) return null
  if (seconds < 90) return `${Math.max(1, Math.round(seconds))} seconds`
  const minutes = Math.ceil(seconds / 60)
  return `${minutes} minute${minutes === 1 ? '' : 's'}`
}

function mapErrorMessage(status: number | undefined, retryAfter: string | null): string {
  switch (status) {
    case 403:
      return 'Verification failed. Please try again.'
    case 422:
      return 'Some fields look off. Please double-check and try again.'
    case 429:
      return retryAfter
        ? `Too many requests. Please try again in ${retryAfter}.`
        : 'Too many requests. Please try again later.'
    case 502:
    case 503:
      return 'We couldn’t send your message right now. Please try again in a few minutes.'
    default:
      return 'Network error. Please check your connection and try again.'
  }
}

export function useContactSubmit() {
  const config = useRuntimeConfig()
  const status = ref<ContactSubmitStatus>('idle')
  const errorMessage = ref<string | null>(null)

  async function submit(body: ContactSubmitBody) {
    status.value = 'submitting'
    errorMessage.value = null
    try {
      await $fetch(`${config.public.apiBaseUrl}/v1/contact`, {
        method: 'POST',
        body,
      })
      status.value = 'success'
    } catch (err) {
      const fetchErr = err as FetchError
      const statusCode = fetchErr.response?.status ?? fetchErr.statusCode ?? fetchErr.status
      const retryAfter = parseRetryAfter(fetchErr.response?.headers?.get?.('retry-after'))
      errorMessage.value = mapErrorMessage(statusCode, retryAfter)
      status.value = 'error'
    }
  }

  function reset() {
    status.value = 'idle'
    errorMessage.value = null
  }

  return { status, errorMessage, submit, reset }
}
