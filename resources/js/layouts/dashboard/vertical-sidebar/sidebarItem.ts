export interface menu {
  header?: string;
  title?: string;
  icon?: string;
  to?: string;
  divider?: boolean;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
  permissions?: string[];
}

const sidebarItem: menu[] = [
  {
    title: 'Home',
    icon: 'custom-home',
    to: '/'
  },
  { header: 'Settings',
    icon: 'custom-setting-2',
   },
  {
    title: 'User Management',
    icon: 'custom-users',
    to: '/user/list',
    permissions: [
        'user-management.access'
    ]
  },
  {
    title: 'Role & Permission',
    icon: 'custom-lock',
    to: '/role/list',
    permissions: [
        'role-management.access'
    ]
  },
];

export default sidebarItem;
