import { z } from 'zod'
import { validationMessages as m } from './messages'
import { requiredTrimmedString } from './primitives'

export const noteTextSchema = requiredTrimmedString(m.noteRequired)

export type NoteTextInput = z.infer<typeof noteTextSchema>
