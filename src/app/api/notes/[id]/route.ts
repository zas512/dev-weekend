import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  archiveNote,
  getNoteById,
  ServiceError,
  updateNote
} from "@/server/services/notes.service";

function errorResponse(error: unknown) {
  if (error instanceof ServiceError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.errors.map((item) => item.message).join(", ") },
      { status: 400 }
    );
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const url = new URL(request.url);
    const archived = url.searchParams.get("archived") === "true";
    const note = await getNoteById(params.id, archived);
    return NextResponse.json(note);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const note = await updateNote(params.id, body);
    return NextResponse.json(note);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    await archiveNote(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
