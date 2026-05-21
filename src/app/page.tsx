"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoteDialog } from "@/components/notes/NoteDialog";
import { NoteGrid } from "@/components/notes/NoteGrid";
import { NoteToolbar } from "@/components/notes/NoteToolbar";
import { Button } from "@/components/ui/button";
import {
  fetchNotes,
  createNote,
  updateNote,
  archiveNote,
  type Note,
  type NoteFormPayload
} from "@/lib/api/notes";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const compareStrings = (a: string, b: string) =>
    a.localeCompare(b, undefined, { sensitivity: "base", numeric: true });
  const filteredTags = useMemo(() => {
    const tagSet = new Set(notes.flatMap((note) => note.tags));
    return Array.from(tagSet).sort(compareStrings);
  }, [notes]);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => setDebouncedSearch(search), 300);
    return () => globalThis.clearTimeout(timer);
  }, [search]);

  const loadNotes = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchNotes(
          {
            archived: activeTab === "archived",
            search: debouncedSearch || undefined,
            tag: tagFilter
          },
          signal
        );
        setNotes(result);
      } catch (err) {
        if ((err as { name: string })?.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unable to load notes.");
      } finally {
        setLoading(false);
      }
    },
    [activeTab, debouncedSearch, tagFilter]
  );

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    queueMicrotask(() => {
      void loadNotes(controller.signal);
    });
    return () => {
      controller.abort();
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  }, [loadNotes]);

  const openNewNote = useCallback(() => {
    setActiveNote(null);
    setDialogOpen(true);
  }, []);

  const openEditNote = useCallback((note: Note) => {
    setActiveNote(note);
    setDialogOpen(true);
  }, []);

  const handleSaveNote = useCallback(
    async (payload: NoteFormPayload) => {
      setIsSaving(true);
      setError(null);
      try {
        if (activeNote) {
          await updateNote(activeNote.id, payload);
        } else {
          await createNote(payload);
        }
        await loadNotes();
        setDialogOpen(false);
        setActiveNote(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to save note.";
        setError(message);
        throw new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [activeNote, loadNotes]
  );

  const handleArchiveNote = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await archiveNote(id);
        await loadNotes();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to archive note."
        );
      }
    },
    [loadNotes]
  );

  const handleTogglePin = useCallback(
    async (note: Note) => {
      setError(null);
      try {
        await updateNote(note.id, { pinned: !note.pinned });
        await loadNotes();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to update note.");
      }
    },
    [loadNotes]
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[.3em] text-slate-500">
                DevBrain
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                Personal knowledge vault
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Create, search, pin, and archive notes in a lightweight,
                polished workspace built for fast capture.
              </p>
            </div>
            <NoteToolbar
              search={search}
              onSearchChange={setSearch}
              onOpenNew={openNewNote}
              searchRef={searchRef}
            />
          </div>
          <NoteDialog
            open={dialogOpen}
            note={activeNote}
            isSaving={isSaving}
            onOpenChange={setDialogOpen}
            onSave={handleSaveNote}
          />
          <Tabs
            defaultValue="active"
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              setTagFilter(undefined);
            }}
          >
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <div className="flex flex-wrap gap-2">
                {filteredTags.length > 0 ? (
                  filteredTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={tagFilter === tag ? "secondary" : "outline"}
                      size="sm"
                      onClick={() =>
                        setTagFilter(tagFilter === tag ? undefined : tag)
                      }
                    >
                      #{tag}
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No tags available yet.
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="archived" />
          </Tabs>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <section className="space-y-4">
            <NoteGrid
              notes={notes}
              loading={loading}
              activeTab={activeTab}
              onEdit={openEditNote}
              onTogglePin={handleTogglePin}
              onArchive={handleArchiveNote}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
