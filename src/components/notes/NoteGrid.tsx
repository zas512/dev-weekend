import { Note } from "@/lib/api/notes";
import { NoteCard } from "@/components/notes/NoteCard";

type NoteGridProps = {
  notes: Note[];
  loading: boolean;
  activeTab: string;
  onEdit: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onArchive: (id: string) => void;
};

export function NoteGrid({
  notes,
  loading,
  activeTab,
  onEdit,
  onTogglePin,
  onArchive,
}: Readonly<NoteGridProps>) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
        Loading notes...
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
        {activeTab === "active"
          ? "No active notes found."
          : "No archived notes yet."}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onTogglePin={onTogglePin}
          onArchive={onArchive}
        />
      ))}
    </div>
  );
}
