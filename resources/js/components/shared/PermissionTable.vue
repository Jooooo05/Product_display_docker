<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  headers: {
    type: Array,
    required: false,
    default: () => []
  },
  items: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectAll: {
    type: Boolean,
    default: false
  },
  hideSelectAll: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:items', 'access-change', 'update:selectAll', 'toggle-all']);

const onAccessChange = (item: any, val?: boolean) => {
  if (val !== undefined) item.access = val;
  // If a module's main access is toggled ON, turn on all its available actions
  if (item.access) {
    if (item.actions) {
      for (const key in item.actions) {
        if (item.actions[key].available) item.actions[key].value = true;
      }
    }
  }
  // If toggled OFF, turn off all actions
  else {
    if (item.actions) {
      for (const key in item.actions) {
        item.actions[key].value = false;
      }
    }
  }
  emit('access-change', item);
};

const onParentAccessChange = (group: any, val?: boolean) => {
  if (val !== undefined) group.parent.access = val;
  // Same logic for parent if it's not a dummy parent
  if (!group.parent.dummy) {
    if (group.parent.access) {
      if (group.parent.actions) {
        for (const key in group.parent.actions) {
          if (group.parent.actions[key].available) group.parent.actions[key].value = true;
        }
      }
    } else {
      if (group.parent.actions) {
        for (const key in group.parent.actions) {
          group.parent.actions[key].value = false;
        }
      }
    }
  }

  emit('access-change', group.parent);

  // Automatically toggle all children when parent is toggled
  group.children.forEach((child: any) => {
    child.access = group.parent.access;
    if (child.access) {
      if (child.actions) {
        for (const key in child.actions) {
          if (child.actions[key].available) child.actions[key].value = true;
        }
      }
    } else {
      if (child.actions) {
        for (const key in child.actions) {
          child.actions[key].value = false;
        }
      }
    }
    emit('access-change', child);
  });
};

const onToggleAll = (val: boolean) => {
  emit('update:selectAll', val);
  emit('toggle-all', val);
};

const hasAnyAction = (item: any) => {
  return item.actions && Object.keys(item.actions).length > 0;
};

const formatActionName = (action: string) => {
  return action.replace(/-/g, ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

// Group items into Parent -> Children hierarchy based on dot notation
const groupedModules = computed(() => {
  const groups: Record<string, { parent: any, children: any[], order: number }> = {};

  let orderCounter = 0;

  props.items.forEach((item: any) => {
    // Determine the base module name.
    const parts = item.module.split('.');
    const base = parts[0];

    if (!groups[base]) {
      groups[base] = { parent: null, children: [], order: orderCounter++ };
    }

    // If it's a parent module (no dot) OR it's a base module that has no children so far
    if (parts.length === 1) {
      groups[base].parent = item;
      // Also format name for parent to be cleaner
      groups[base].parent.name = base.replace(/-/g, ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    // If it's a child module (contains dot)
    else {
      // Format child name, e.g. "warehouse.received-items" -> "received-items" -> "Received Items"
      const childNamePart = parts.slice(1).join(' ').replace(/-/g, ' ');
      item.displayName = childNamePart.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      groups[base].children.push(item);
    }
  });

  // Cleanup missing parents if any
  Object.keys(groups).forEach(key => {
    if (!groups[key].parent) {
      groups[key].parent = {
        module: key,
        name: key.replace(/-/g, ' ').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        access: groups[key].children.some((c: any) => c.access),
        dummy: true,
        hasAccess: true, // Force parent to exist logically
        actions: {}
      };
    }
  });

  // Sort according to the original appearance order in the items array
  return Object.values(groups).sort((a: any, b: any) => a.order - b.order);
});
</script>

<template>
  <div class="permission-table-wrapper">
    <div v-if="!hideSelectAll" class="d-flex justify-end mb-2">
      <v-switch
        :model-value="selectAll"
        @update:model-value="onToggleAll"
        color="primary"
        hide-details
        inset
        label="Select All"
        class="ms-auto"
      />
    </div>

    <v-skeleton-loader v-if="loading" type="table-row@50"></v-skeleton-loader>

    <template v-else>
      <div v-for="(group, index) in groupedModules" :key="index" class="mb-8">

        <!-- Main Parent Module -->
        <div class="d-flex justify-space-between align-center mb-4">
          <v-switch
            v-if="group.parent"
            v-model="group.parent.access"
            @update:model-value="(val) => onParentAccessChange(group, val)"
            color="error"
            hide-details
            inset
            class="font-weight-medium"
          >
            <template v-slot:label>
              <span class="text-subtitle-1 font-weight-bold">{{ group.parent.name }}</span>
            </template>
          </v-switch>
        </div>

        <!-- Parent Table (only if it has specific actions) -->
        <v-table v-if="hasAnyAction(group.parent) && !group.parent.dummy" class="border rounded-md customize-table mb-2">
          <thead class="bg-containerBg">
            <tr>
              <th class="text-left text-uppercase font-weight-bold" style="width: 50%">Access</th>
              <th class="text-left text-uppercase font-weight-bold" style="width: 50%">Switch</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(actionData, actionKey) in group.parent.actions" :key="actionKey">
              <tr>
                <td class="text-left font-weight-medium">{{ formatActionName(actionKey) }}</td>
                <td class="text-left">
                  <v-switch
                    v-model="actionData.value"
                    color="success"
                    hide-details
                    density="compact"
                    inset
                    :disabled="!group.parent.access"
                    class="d-inline-flex"
                  ></v-switch>
                </td>
              </tr>
            </template>
          </tbody>
        </v-table>

        <!-- Children Modules (Nested visually) -->
        <div v-if="group.children.length > 0" class="pl-6 border-s-sm ms-3 mt-4" style="border-left: 2px dashed rgba(var(--v-theme-borderLight), 0.5) !important;">
          <div v-for="child in group.children" :key="child.module" class="mb-6">

            <!-- Child Module Switch -->
            <v-switch
              v-model="child.access"
              @update:model-value="(val) => onAccessChange(child, val)"
              color="error"
              hide-details
              :disabled="!group.parent.access"
              class="mb-3 font-weight-medium"
            >
              <template v-slot:label>
                <span class="text-subtitle-2 font-weight-bold">{{ child.displayName }}</span>
              </template>
            </v-switch>

            <!-- Child Table -->
            <v-table v-if="hasAnyAction(child)" class="border rounded-md customize-table">
              <thead class="bg-containerBg">
                <tr>
                  <th class="text-left text-uppercase font-weight-bold" style="width: 50%">Access</th>
                  <th class="text-left text-uppercase font-weight-bold" style="width: 50%">Switch</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(actionData, actionKey) in child.actions" :key="actionKey">
                  <tr>
                    <td class="text-left font-weight-medium">{{ formatActionName(actionKey) }}</td>
                    <td class="text-left">
                      <v-switch
                        v-model="actionData.value"
                        color="success"
                        hide-details
                        density="compact"
                        inset
                        :disabled="!child.access"
                        class="d-inline-flex"
                      ></v-switch>
                    </td>
                  </tr>
                </template>
              </tbody>
            </v-table>

          </div>
        </div>

      </div>
    </template>
  </div>
</template>
