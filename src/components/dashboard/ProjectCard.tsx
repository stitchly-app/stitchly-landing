import { Card } from "@/components/ui/card";
import { MoreVertical, Edit, FileDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  title: string;
  thumbnail: string;
  duration: string;
  timestamp: string;
  onEdit: () => void;
  onExport?: () => void;
  onDelete?: () => void;
}

export const ProjectCard = ({ title, thumbnail, duration, timestamp, onEdit, onExport, onDelete }: ProjectCardProps) => {
  return (
    <Card className="bg-card border-border overflow-hidden cursor-pointer group" onClick={onEdit}>
      <div className="relative aspect-video bg-muted">
        <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
          {duration}
        </div>
      </div>
      <div className="p-4 flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onExport?.(); }}>
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
