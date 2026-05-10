<template>
  <v-card elevation="0" :color="cardColor" rounded="lg">
    <v-card-item>
      <v-list class="py-0" :class="`bg-${cardColor}`" aria-label="widget-card" aria-busy="true">
        <v-list-item class="pa-0">
            <h5 class="text-h5 mb-0 text-truncate" :class="textColorClass">{{ title }}</h5>
            <p class="text-body-1 mb-0 text-truncate" :class="textColorClass">{{ value }}</p>
          <template v-slot:append>
            <v-avatar 
              variant="tonal" 
              :color="avatarColor" 
              size="large" 
              rounded="md"
            >
              <SvgSprite 
                :name="iconName" 
                :class="iconColorClass" 
                style="width: 28px; height: 28px" 
              />
            </v-avatar>
          </template>
        </v-list-item>
      </v-list>
    </v-card-item>
  </v-card>
</template>

<script>
import SvgSprite from '@/components/shared/SvgSprite.vue';

export default {
  name: 'WidgetCard2',
  components: {
    SvgSprite
  },
  props: {
    // Card color (primary, secondary, success, warning, error, info, etc.)
    cardColor: {
      type: String,
      default: 'primary'
    },
    // Title text
    title: {
      type: String,
      default: 'Available Balance'
    },
    // Value to display
    value: {
      type: [String, Number],
      default: '$1,234.90'
    },
    // Icon name for SvgSprite
    iconName: {
      type: String,
      default: 'custom-bidirectional'
    },
    // Avatar background color
    avatarColor: {
      type: String,
      default: 'white'
    },
    // Text color theme (light or dark)
    textTheme: {
      type: String,
      default: 'light', // 'light' for white text, 'dark' for dark text
      validator: (value) => ['light', 'dark'].includes(value)
    },
    // Icon color theme (light or dark)
    iconTheme: {
      type: String,
      default: 'light', // 'light' for white icon, 'dark' for dark icon
      validator: (value) => ['light', 'dark'].includes(value)
    }
  },
  computed: {
    textColorClass() {
      return this.textTheme === 'light' ? 'text-white' : 'text-black';
    },
    iconColorClass() {
      return this.iconTheme === 'light' ? 'text-white' : 'text-black';
    }
  }
};
</script>