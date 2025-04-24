import { z } from "zod";

export const createNoteSchema = z.object({
  content: z
    .string()
    .min(300, { message: "Note must be at least 300 characters long" })
    .max(10000, { message: "Note cannot exceed 10000 characters" }),
  category_id: z.string().uuid({ message: "Valid category ID is required" }),
  summary: z.string().optional(),
});

export type CreateNotePayload = z.infer<typeof createNoteSchema>;
