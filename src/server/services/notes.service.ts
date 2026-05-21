import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createNoteSchema,
  updateNoteSchema
} from "@/server/validators/notes.schema";

export class ServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export type NotesQueryOptions = {
  archived?: boolean;
  tag?: string;
  search?: string | null;
};

function normalizeSearch(search?: string | null) {
  const trimmed = search?.trim();
  return trimmed?.length ? trimmed : undefined;
}

function encodeTags(tags: string[]) {
  const normalized = tags.map((tag) => tag.trim()).filter(Boolean);
  return normalized.length ? `,${normalized.join(",")},` : "";
}

function decodeTags(value: string) {
  return value.length ? value.split(",").filter(Boolean) : [];
}

function hydrateNote(note: Prisma.NoteGetPayload<object>) {
  return {
    ...note,
    tags: decodeTags(note.tags as string)
  };
}

export async function listNotes(options: NotesQueryOptions = {}) {
  const where: Prisma.NoteWhereInput = {
    archived: options.archived ?? false
  };
  if (options.tag) {
    where.tags = { contains: `,${options.tag},` };
  }
  const search = normalizeSearch(options.search);
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { content: { contains: search } }
    ];
  }
  const notes = await prisma.note.findMany({
    where,
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }]
  });
  return notes.map(hydrateNote);
}

export async function getNoteById(id: string, includeArchived = false) {
  if (!id?.trim()) {
    throw new ServiceError("Invalid note ID", 400);
  }
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || (!includeArchived && note.archived)) {
    throw new ServiceError("Note not found", 404);
  }

  return hydrateNote(note);
}

export async function createNote(input: unknown) {
  try {
    const validated = createNoteSchema.parse(input);
    const note = await prisma.note.create({
      data: {
        ...validated,
        tags: encodeTags(validated.tags)
      }
    });
    return hydrateNote(note);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ServiceError(
        error.errors.map((err) => err.message).join(", "),
        400
      );
    }
    throw error;
  }
}

export async function updateNote(id: string, input: unknown) {
  if (!id?.trim()) {
    throw new ServiceError("Invalid note ID", 400);
  }
  const existingNote = await prisma.note.findUnique({ where: { id } });
  if (!existingNote) {
    throw new ServiceError("Note not found", 404);
  }
  if (existingNote.archived) {
    throw new ServiceError("Cannot update archived note", 400);
  }
  try {
    const validated = updateNoteSchema.parse(input);
    const data: Prisma.NoteUpdateInput = {};
    if (validated.title !== undefined) {
      data.title = validated.title;
    }
    if (validated.content !== undefined) {
      data.content = validated.content;
    }
    if (validated.pinned !== undefined) {
      data.pinned = validated.pinned;
    }
    if ("tags" in validated) {
      data.tags = encodeTags(validated.tags ?? []);
    }
    const note = await prisma.note.update({ where: { id }, data });
    return hydrateNote(note);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ServiceError(
        error.errors.map((err) => err.message).join(", "),
        400
      );
    }
    throw error;
  }
}

export async function archiveNote(id: string) {
  if (!id?.trim()) {
    throw new ServiceError("Invalid note ID", 400);
  }
  const existingNote = await prisma.note.findUnique({ where: { id } });
  if (!existingNote) {
    throw new ServiceError("Note not found", 404);
  }
  const note = await prisma.note.update({
    where: { id },
    data: { archived: true }
  });
  return hydrateNote(note);
}
