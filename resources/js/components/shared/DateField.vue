<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
    <template #activator="{ props }">
      <v-text-field
        single-line
        hide-details
        :readonly="readonly"
        :variant="variant"
        v-bind="props"
        v-model="display"
        :placeholder="placeholder"
        :density="density"
        color="primary"
        @click="menu = true"
      >
        <template #append-inner>
          <SvgSprite name="custom-calendar" class="text-lightText" style="width: 20px; height: 20px" />
        </template>
      </v-text-field>
    </template>
    <v-date-picker
      :model-value="selected"
      hide-header
      color="primary"
      @update:model-value="onPick"
    />
  </v-menu>
</template>

<script>
import SvgSprite from '@/components/shared/SvgSprite.vue';

export default {
  name: 'DateField',
  components: {
    SvgSprite
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    variant: {
      type: String,
      default: 'outlined'
    },
    density: {
      type: String,
      default: 'comfortable'
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'update:raw'],
  data() {
    return {
      menu: false,
      selected: null
    };
  },
  computed: {
    display: {
      get() {
        if (!this.selected) return '';
        const dt = new Date(this.selected);
        if (isNaN(dt.getTime())) return '';
        const dd = String(dt.getDate()).padStart(2, '0');
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const yyyy = dt.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      },
      set(val) {
        if (!val) {
          this.selected = null;
          this.$emit('update:modelValue', '');
          this.$emit('update:raw', null);
          return;
        }
        const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(val);
        if (!m) return;
        const dd = m[1].padStart(2, '0');
        const mm = m[2].padStart(2, '0');
        const yyyy = m[3];
        const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
        this.selected = d;
        this.$emit('update:modelValue', `${dd}/${mm}/${yyyy}`);
        this.$emit('update:raw', d);
      }
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (!val) {
          this.selected = null;
          return;
        }
        const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(val);
        if (!m) return;
        const dd = m[1].padStart(2, '0');
        const mm = m[2].padStart(2, '0');
        const yyyy = m[3];
        this.selected = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
      }
    }
  },
  methods: {
    onPick(val) {
      if (!val) {
        this.selected = null;
        this.$emit('update:modelValue', '');
        this.$emit('update:raw', null);
        this.menu = false;
        return;
      }
      const d = typeof val === 'string' ? new Date(`${val}T00:00:00`) : val;
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      this.selected = d;
      this.$emit('update:modelValue', `${dd}/${mm}/${yyyy}`);
      this.$emit('update:raw', d);
      this.menu = false;
    }
  }
};
</script>
