import sidebarItem from '../vertical-sidebar/sidebarItem';
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
  subCaption?: string;
  class?: string;
  extraclass?: string;
  type?: string;
}

const horizontalItems: menu[] = [];
let currentHeaderGroup: menu | null = null;

sidebarItem.forEach((item) => {
  if (item.header) {
    // Ubah header menjadi parent menu (dropdown)
    currentHeaderGroup = {
      title: item.header,
      icon: item.icon, // Icon default untuk menu dropdown hasil dari header
      children: []
    };
    horizontalItems.push(currentHeaderGroup);
  } else {
    if (currentHeaderGroup) {
      // Masukkan item ke dalam header group yang sedang aktif
      currentHeaderGroup.children!.push(item);
    } else {
      // Jika belum ada header (menu paling atas), biarkan menjadi top-level menu
      horizontalItems.push(item);
    }
  }
});

export default horizontalItems;
