export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NoteFormPayload = {
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
};

export type NotesQuery = {
  archived?: boolean;
  tag?: string;
  search?: string;
};

const createQueryString = (query: NotesQuery) => {
  const params = new URLSearchParams();
  if (query.archived) params.set("archived", "true");
  if (query.search) params.set("search", query.search);
  if (query.tag) params.set("tag", query.tag);
  return params.toString();
};

const parseError = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  return (data as { error?: string }).error || "An unexpected error occurred.";
};

export async function fetchNotes(query: NotesQuery = {}, signal?: AbortSignal) {
  const response = await fetch(`/api/notes?${createQueryString(query)}`, { signal });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json() as Promise<Note[]>;
}

export async function createNote(payload: NoteFormPayload) {
  const response = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<Note>;
}

export async function updateNote(id: string, payload: Partial<NoteFormPayload>) {
  const response = await fetch(`/api/notes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<Note>;
}

export async function archiveNote(id: string) {
  const response = await fetch(`/api/notes/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}
