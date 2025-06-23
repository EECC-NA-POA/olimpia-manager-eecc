
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { MenuItem as MenuItemType } from './types';

interface MenuItemProps {
  item: MenuItemType;
  index: number;
}

export const MenuItem = ({ item, index }: MenuItemProps) => {
  const location = useLocation();

  return (
    <SidebarMenuItem key={item.path + index}>
      <SidebarMenuButton 
        asChild={!item.isAction}
        isActive={!item.isAction && location.pathname === item.path}
        tooltip={item.tooltip}
        className={`text-white hover:bg-olimpics-green-secondary/20 data-[active=true]:bg-olimpics-green-secondary data-[active=true]:text-white group-data-[collapsible=icon]:justify-center ${item.className || ''}`}
        onClick={item.isAction ? item.action : undefined}
      >
        {item.isAction ? (
          <div className="flex items-center">
            {item.icon}
            <span className="ml-3 group-data-[collapsible=icon]:hidden">{item.label}</span>
          </div>
        ) : (
          <Link to={item.path} className="flex items-center">
            {item.icon}
            <span className="ml-3 group-data-[collapsible=icon]:hidden">{item.label}</span>
          </Link>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
