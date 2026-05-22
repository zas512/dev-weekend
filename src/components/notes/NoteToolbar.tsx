import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefObject } from "react";

type NoteToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onOpenNew: () => void;
  searchRef?: RefObject<HTMLInputElement | null>;
};

export function NoteToolbar({
  search,
  onSearchChange,
  onOpenNew,
  searchRef
}: Readonly<NoteToolbarProps>) {
  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          ref={searchRef}
          className="pl-10"
          placeholder="Search notes"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <Button size="lg" onClick={onOpenNew}>
        <Plus className="mr-2 h-4 w-4" /> New note
      </Button>
    </div>
  );
}
