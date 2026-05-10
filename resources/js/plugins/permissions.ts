import { App } from 'vue';
import { useAccessStore } from '@/stores/user-management/access-store';

export const permissionDirective = {
  mounted(el: HTMLElement, binding: any) {
    const { value } = binding;
    const accessStore = useAccessStore();

    if (value && typeof value === 'string') {
      if (!accessStore.hasPermission(value)) {
        // Remove the element from DOM
        el.parentNode?.removeChild(el);
      }
    } else if (value && Array.isArray(value)) {
        if (!accessStore.hasAnyPermission(value)) {
            el.parentNode?.removeChild(el);
        }
    } else {
      // If no value provided, we might want to throw error or ignore
      // console.warn('v-permission directive used without a value');
    }
  },
  // Handle updates if permissions change dynamically (though usually they don't without reload/re-login)
  updated(el: HTMLElement, binding: any) {
    const { value } = binding;
    const accessStore = useAccessStore();

    if (value && typeof value === 'string') {
      if (!accessStore.hasPermission(value)) {
         el.parentNode?.removeChild(el);
      }
    } else if (value && Array.isArray(value)) {
        if (!accessStore.hasAnyPermission(value)) {
             el.parentNode?.removeChild(el);
        }
    }
  }
};

export default {
    install(app: App) {
        app.directive('permission', permissionDirective);
    }
};
