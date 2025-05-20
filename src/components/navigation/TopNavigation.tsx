
import React from 'react';
import { TabbedNavigation } from './TabbedNavigation';

interface TopNavigationProps {
  user: any;
  roles: any;
}

export function TopNavigation({ user, roles }: TopNavigationProps) {
  return <TabbedNavigation user={user} roles={roles} />;
}
