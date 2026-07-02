export function getStatusBadgeStyle(status: string): string {
  switch (status) {
    case 'confirmado':
      return 'bg-success-background text-success-foreground border-success/20';
    case 'pendente':
      return 'bg-warning-background text-warning-foreground border-warning/20';
    case 'cancelado':
      return 'bg-destructive/10 text-destructive-foreground border-destructive/20';
    case 'isento':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    default:
      return 'bg-neutral-background text-neutral-foreground border-neutral/20';
  }
}

export function getStatusBorderColor(status: string): string {
  switch (status) {
    case 'confirmado':
      return 'border-l-4 border-l-success bg-success-background/50';
    case 'pendente':
      return 'border-l-4 border-l-warning bg-warning-background/50';
    case 'cancelado':
      return 'border-l-4 border-l-destructive bg-destructive/5';
    case 'isento':
      return 'border-l-4 border-l-sky-500 bg-sky-50/50';
    default:
      return 'border-l-4 border-l-neutral bg-neutral-background/50';
  }
}
