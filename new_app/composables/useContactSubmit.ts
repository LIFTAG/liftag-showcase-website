import { contactErrorMessage, type ContactSubmitError } from '../utils/contactError.ts'

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

function parseRetryAfter(value: string | null | undefined): { amount: number, unit: 'seconds' | 'minutes' } | null {
  if (!value) return null
  const seconds = Number(value)
  if (!Number.isFinite(seconds) || seconds <= 0) return null
  if (seconds < 90) return { amount: Math.max(1, Math.round(seconds)), unit: 'seconds' }
  const minutes = Math.ceil(seconds / 60)
  return { amount: minutes, unit: 'minutes' }
}

function mapErrorCode(status: number | undefined, retryAfter: ReturnType<typeof parseRetryAfter>): ContactSubmitError {
  switch (status) {
    case 403:
      return { code: 'verification' }
    case 422:
      return { code: 'invalid' }
    case 429:
      return retryAfter
        ? { code: 'tooManyRetry', retryAfter: retryAfter.amount, retryUnit: retryAfter.unit }
        : { code: 'tooMany' }
    case 502:
    case 503:
      return { code: 'unavailable' }
    default:
      return { code: 'network' }
  }
}

export function useContactSubmit() {
  const config = useRuntimeConfig()
  const status = ref<ContactSubmitStatus>('idle')
  const errorCode = ref<ContactSubmitError | null>(null)
  // Compatibility for non-UI callers; forms resolve the same messages in their active locale.
  const errorMessage = { get value() { return contactErrorMessage(errorCode.value, 'en') } }

  async function submit(body: ContactSubmitBody) {
    status.value = 'submitting'
    errorCode.value = null
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
      errorCode.value = mapErrorCode(statusCode, retryAfter)
      status.value = 'error'
    }
  }

  function reset() {
    status.value = 'idle'
    errorCode.value = null
  }

  return { status, errorCode, errorMessage, submit, reset }
}
