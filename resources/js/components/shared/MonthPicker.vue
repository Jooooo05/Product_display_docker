<template>
  <v-card elevation="0">

    <!-- Year Navigation -->
    <div class="d-flex align-center justify-center pa-4">
      <v-btn 
        icon 
        variant="text" 
        size="small" 
        @click="previousYear"
        class="text-white"
      >
         <svg-icon type="mdi" :path="mdiChevronLeft"></svg-icon>
      </v-btn>
      
      <div class="text-h6 mx-4 text-white font-weight-medium">
        {{ currentYear }}
      </div>
      
      <v-btn 
        icon 
        variant="text" 
        size="small" 
        @click="nextYear"
        class="text-white"
      >
         <svg-icon type="mdi" :path="mdiChevronRight"></svg-icon>
      </v-btn>
    </div>

    <!-- Month Grid -->
    <v-card-text class="pa-4">
      <v-row no-gutters>
        <v-col 
          v-for="(month, index) in months" 
          :key="index"
          cols="3" 
          class="pa-1"
        >
          <v-btn 
            :variant="isSelectedMonth(index) ? 'elevated' : 'text'"
            :color="isSelectedMonth(index) ? 'primary' : 'default'"
            class="month-btn"
            size="large"
            block
            rounded="lg"
            @click="selectMonth(index)"
          >
            {{ month }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import SvgSprite from '@/components/shared/SvgSprite.vue'
import { mdiRefresh, mdiChevronLeft, mdiChevronRight, mdiFileExport } from '@mdi/js';

export default {
  name: 'MonthPicker',
   components: {
    SvgSprite,
},
  props: {
    modelValue: {
      type: [String, Date],
      default: null
    },
    headerText: {
      type: String,
      default: 'SELECT MONTH'
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
    mdiRefresh,
      mdiChevronRight,
      mdiChevronLeft,
      currentYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth(),
      months: [
        'Jan', 'Feb', 'Mar', 'Apr',
        'May', 'Jun', 'Jul', 'Aug', 
        'Sep', 'Oct', 'Nov', 'Dec'
      ]
    }
  },
  computed: {
    selectedMonthDisplay() {
      if (this.selectedMonth !== null) {
        return `${this.months[this.selectedMonth]} ${this.currentYear}`
      }
      return 'Select a month'
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          const date = new Date(newValue)
          this.currentYear = date.getFullYear()
          this.selectedMonth = date.getMonth()
        }
      }
    }
  },
  mounted() {
    // Emit bulan saat ini ketika komponen dimuat
    const currentDate = new Date(this.currentYear, this.selectedMonth, 1)
    this.$emit('update:modelValue', currentDate)
  },
  methods: {
    previousYear() {
      this.currentYear--
    },
    nextYear() {
      this.currentYear++
    },
    selectMonth(monthIndex) {
      this.selectedMonth = monthIndex
      const selectedDate = new Date(this.currentYear, monthIndex, 1)
      this.$emit('update:modelValue', selectedDate)
    },
    isSelectedMonth(monthIndex) {
      return this.selectedMonth === monthIndex
    }
  }
}
</script>

