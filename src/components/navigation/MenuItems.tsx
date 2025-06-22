
import React from 'react';
import { SidebarMenu, SidebarGroup, SidebarGroupContent } from '@/components/ui/sidebar';
import { useMenuItems } from './hooks/useMenuItems';
import { MenuItem } from './MenuItem';
import { MenuItemsProps } from './types';

export const MenuItems = ({ onLogout, userId }: MenuItemsProps) => {
  const menuItems = useMenuItems(onLogout);

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {menuItems.map((item, index) => (
            <MenuItem key={item.path + index} item={item} index={index} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
