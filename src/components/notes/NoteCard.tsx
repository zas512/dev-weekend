import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Pin, Star, Trash2 } from "lucide-react";
import { Note } from "@/lib/api/notes";

type NoteCardProps = {
  note: Note;
  onEdit: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onArchive: (id: string) => void;
};

export function NoteCard({
  note,
  onEdit,
  onTogglePin,
  onArchive
}: Readonly<NoteCardProps>) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              {note.title}
              {note.pinned ? <Star className="h-4 w-4 text-amber-500" /> : null}
            </CardTitle>
            <CardDescription>
              {new Date(note.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            title={note.pinned ? "Unpin note" : "Pin note"}
            onClick={() => onTogglePin(note)}
          >
            <Pin
              className={
                note.pinned
                  ? "h-4 w-4 text-amber-500"
                  : "h-4 w-4 text-slate-500"
              }
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-4 text-sm leading-6 text-slate-700">
          {note.content || "No content yet."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap gap-2">
          {note.archived ? null : (
            <Button variant="outline" size="sm" onClick={() => onEdit(note)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onArchive(note.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {note.archived ? "Archived" : "Archive"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
