import { sv } from '~/lib/i18n/sv'

function messageFromData(data: unknown): string | null {
  if (typeof data === 'string') {
    return data
  }
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message
    return typeof message === 'string' ? message : null
  }
  return null
}

export function authErrorMessage(error: unknown): string {
  const raw = messageFromData(error) ?? (error instanceof Error ? error.message : null) ?? 'UNKNOWN'

  if (raw.includes('AUTH_SIGNUP_DISABLED')) {
    return sv.auth.errors.signupDisabled
  }
  if (raw.includes('Invalid credentials')) {
    return sv.auth.errors.invalidCredentials
  }
  if (raw.includes('Invalid password')) {
    return sv.auth.errors.invalidPassword
  }

  return sv.auth.errors.generic
}
