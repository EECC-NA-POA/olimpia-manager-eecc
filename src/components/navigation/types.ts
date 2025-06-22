
export interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  tooltip: string;
  isAction?: boolean;
  action?: () => void;
  className?: string;
}

export interface MenuItemsProps {
  onLogout: () => void;
  userId: string;
}
