import { toast as sonnerToast } from 'sonner'
import { sv } from '~/lib/i18n/sv'

export const toast = {
  error(message: string = sv.common.saveError) {
    sonnerToast.error(message)
  },
  success(message: string) {
    sonnerToast.success(message)
  },
  deleteError() {
    sonnerToast.error(sv.common.deleteError)
  },
}
