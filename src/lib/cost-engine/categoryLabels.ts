import { sv } from '~/lib/i18n/sv'
import type { CostCategory } from './types'

export function costCategoryLabel(category: CostCategory): string {
  return sv.detail.categories[category]
}
