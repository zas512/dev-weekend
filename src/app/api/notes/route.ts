import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { createNote, listNotes, ServiceError } from '@/server/services/notes.service';

function errorResponse(error: unknown) {
  if (error instanceof ServiceError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.errors.map((item) => item.message).join(', ') }, { status: 400 });
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const archived = url.searchParams.get('archived') === 'true';
  const tag = url.searchParams.get('tag') ?? undefined;
  const search = url.searchParams.get('search') ?? undefined;

  const notes = await listNotes({ archived, tag, search });
  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const note = await createNote(body);
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
