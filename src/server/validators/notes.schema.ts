import { z } from 'zod';

const trimmedTitle = z.string().trim().min(1, { message: 'Title is required' });

export const createNoteSchema = z.object({
  title: trimmedTitle,
  content: z.string().optional().transform((value) => value ?? ''),
  tags: z
    .array(z.string().trim())
    .optional()
    .transform((value) => value?.filter((tag) => tag.length > 0) ?? []),
  pinned: z.boolean().optional().default(false),
});

export const updateNoteSchema = z
  .object({
    title: trimmedTitle.optional(),
    content: z.string().optional(),
    tags: z
      .array(z.string().trim())
      .optional()
      .transform((value) => (value ? value.filter((tag) => tag.length > 0) : undefined)),
    pinned: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type CreateNoteInput = z.input<typeof createNoteSchema>;
export type UpdateNoteInput = z.input<typeof updateNoteSchema>;
