import { useEffect, useState, useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Note, NoteFormPayload } from "@/lib/api/notes";

type NoteDialogProps = {
  open: boolean;
  note?: Note | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: NoteFormPayload) => Promise<void>;
};

export function NoteDialog({ open, note, isSaving, onOpenChange, onSave }: NoteDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [pinned, setPinned] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setTags(note?.tags.join(", ") ?? "");
    setPinned(note?.pinned ?? false);
    setFormError(null);
  }, [note, open]);

  // handle keyboard shortcuts inside the dialog
  const submittedRef = useRef(false);
  useEffect(() => {
    if (!open) return;

    const onKey = async (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter -> submit
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (isSaving || submittedRef.current) return;
        submittedRef.current = true;
        try {
          await handleSubmit(new Event("submit") as unknown as FormEvent<HTMLFormElement>);
        } finally {
          submittedRef.current = false;
        }
      }

      // Escape -> close
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isSaving, title, content, tags, pinned]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setFormError("Title is required.");
      return;
    }

    const payload: NoteFormPayload = {
      title: trimmedTitle,
      content: content.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      pinned,
    };

    setFormError(null);

    try {
      await onSave(payload);
      onOpenChange(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save note.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{note ? "Edit note" : "Create note"}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Save a new thought, add tags, and pin important notes for fast retrieval.
          </p>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="A concise note title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note-content">Content</Label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write note details or markdown here"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="grid gap-2">
              <Label htmlFor="note-tags">Tags</Label>
              <Input
                id="note-tags"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="tag1, tag2"
              />
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Label htmlFor="note-pinned" className="mb-0 text-sm">
                Pin note
              </Label>
              <Input
                id="note-pinned"
                type="checkbox"
                checked={pinned}
                onChange={(event) => setPinned(event.target.checked)}
                className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-ring"
              />
            </div>
          </div>
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSaving}>
              {note ? "Save changes" : "Create note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
