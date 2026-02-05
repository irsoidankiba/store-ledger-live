import { Code2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-4 px-4 border-t border-border bg-card">
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Code2 className="h-3 w-3" />
        <span>
          Développé par{' '}
          <span className="font-medium text-foreground">Mohamed Irsoid</span>
          {' & '}
          <span className="font-medium text-foreground">Ibrahim Mahamoud</span>
        </span>
      </div>
    </footer>
  );
}
