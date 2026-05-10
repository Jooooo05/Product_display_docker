<!--
/**
 * DateRangeComp - Komponen Vue untuk Pemilihan Tanggal dan Rentang Tanggal
 * 
 * DESKRIPSI:
 * Komponen ini menyediakan interface untuk memilih tanggal tunggal atau rentang tanggal
 * dengan menggunakan Vuetify date picker. Mendukung validasi, format tanggal yang fleksibel,
 * dan berbagai mode penggunaan.
 * 
 * FITUR UTAMA:
 * - Single date selection dan date range selection
 * - Validasi tanggal masa lalu (opsional)
 * - Required field validation
 * - Format display: DD/MM/YYYY
 * - Format data: YYYY-MM-DD
 * - Multiple emit events untuk integrasi yang fleksibel
 * 
 * PROPS:
 * @prop {String} modelValue - Nilai utama untuk v-model (format: "DD/MM/YYYY" atau "DD/MM/YYYY to DD/MM/YYYY")
 * @prop {String} placeholder - Teks placeholder (default: "Select Date Range")
 * @prop {Boolean} disabled - Status disabled komponen (default: false)
 * @prop {Boolean} required - Validasi required field (default: false)
 * @prop {Boolean} allowPastDates - Mengizinkan pemilihan tanggal masa lalu (default: false)
 * @prop {Object|Array} holidays - Data hari libur (default: {})
 * @prop {Array} dateRange - Array tanggal dalam rentang (format: ["YYYY-MM-DD", ...])
 * @prop {String} dateFrom - Tanggal mulai (format: "YYYY-MM-DD")
 * @prop {String} dateTo - Tanggal akhir (format: "YYYY-MM-DD")
 * 
 * EVENTS:
 * @emit update:modelValue - Emit ketika nilai utama berubah
 * @emit update:dateRange - Emit array lengkap tanggal dalam rentang
 * @emit update:dateFrom - Emit tanggal mulai
 * @emit update:dateTo - Emit tanggal akhir
 * 
 * CONTOH PENGGUNAAN:
 * 
 * 1. BASIC USAGE - Single Date:
 * <DateRangeComp 
 *   v-model="selectedDate"
 *   placeholder="Pilih Tanggal"
 * />
 * 
 * 2. DATE RANGE dengan Validasi:
 * <DateRangeComp 
 *   v-model="dateRange"
 *   :required="true"
 *   :allow-past-dates="false"
 *   placeholder="Pilih Rentang Tanggal"
 * />
 * 
 * 3. ADVANCED USAGE dengan Multiple Bindings:
 * <DateRangeComp 
 *   v-model="displayDate"
 *   v-model:date-range="fullDateRange"
 *   v-model:date-from="startDate"
 *   v-model:date-to="endDate"
 *   :required="true"
 *   placeholder="Periode Laporan"
 * />
 * 
 * 4. FILTER DATA dengan Date Range:
 * <DateRangeComp 
 *   v-model="filterDate"
 *   @update:date-range="handleDateRangeFilter"
 *   placeholder="Filter berdasarkan tanggal"
 * />
 * 
 * 5. FORM INPUT dengan Validasi:
 * <DateRangeComp 
 *   v-model="formData.period"
 *   :required="true"
 *   :disabled="isLoading"
 *   :allow-past-dates="true"
 *   placeholder="Periode Cuti"
 * />
 * 
 * DATA FLOW:
 * 1. User clicks calendar icon → openDatePicker()
 * 2. Date picker dialog opens dengan data existing (jika ada)
 * 3. User selects date(s) → selectedDate updated
 * 4. User clicks Submit → confirmDatePicker()
 * 5. Component emits multiple events:
 *    - update:modelValue (format display)
 *    - update:dateRange (array lengkap)
 *    - update:dateFrom (tanggal mulai)
 *    - update:dateTo (tanggal akhir)
 * 
 * FORMAT DATA:
 * - Display Format: "25/12/2024" atau "25/12/2024 to 31/12/2024"
 * - Internal Format: "2024-12-25" atau ["2024-12-25", "2024-12-26", ...]
 * - Date Range: Array berisi semua tanggal dalam rentang (termasuk tanggal di antara start dan end)
 * 
 * VALIDASI:
 * - Required: Memastikan field tidak kosong
 * - Past Dates: Mencegah pemilihan tanggal masa lalu (jika allowPastDates = false)
 * - Format: Otomatis handle konversi format tanggal
 * 
 * INTEGRATION TIPS:
 * 1. Gunakan v-model untuk binding sederhana
 * 2. Gunakan multiple v-model untuk kontrol penuh atas data
 * 3. Listen ke events untuk real-time processing
 * 4. Combine dengan form validation library untuk validasi kompleks
 * 5. Gunakan dateRange array untuk filtering data berdasarkan rentang tanggal
 */
-->

<template>
  <v-text-field
    :model-value="displayValue"
    ref="datePicker"
    :placeholder="placeholder"
    variant="outlined"
    density="comfortable"
    readonly
    hide-details
    :rules="validationRules"
    :disabled="disabled"
  >
    <template v-slot:append-inner>
      <v-btn icon variant="text" size="small" @click="openDatePicker" color="primary" :disabled="disabled">
        <SvgSprite name="custom-calendar" class="text-lightText" style="width: 20px; height: 20px" />
      </v-btn>
    </template>
  </v-text-field>

  <!-- Date Picker Dialog -->
  <v-dialog v-model="datePickerDialog" max-width="400px" persistent>
    <v-card>
      <v-card-text class="pa-0">
        <v-date-picker
          v-model="selectedDate"
          :min="minDate"
          color="primary"
          elevation="0"
          width="100%"
          multiple="range"
          show-adjacent-months
        ></v-date-picker>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" color="error" @click="cancelDatePicker">Cancel</v-btn>
        <v-btn color="primary" variant="flat" rounded="md" @click="confirmDatePicker">Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from 'moment';
import SvgSprite from '@/components/shared/SvgSprite.vue';

export default {
  name: 'DateRangeComp',
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
      default: 'Select Date Range'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    allowPastDates: {
      type: Boolean,
      default: false
    },
    holidays: {
      type: [Object, Array],
      default: () => ({})
    },
    dateRange: {
      type: Array,
      default: () => []
    },
    dateFrom: {
      type: String,
      default: null
    },
    dateTo: {
      type: String,
      default: null
    }
  },
  emits: ['update:modelValue', 'update:dateRange', 'update:dateFrom', 'update:dateTo'],
  data() {
    return {
      datePickerDialog: false,
      selectedDate: []
    };
  },
  computed: {
    displayValue() {
      return this.modelValue;
    },
    minDate() {
      return this.allowPastDates ? null : moment().format('YYYY-MM-DD');
    },
    validationRules() {
      const rules = [];

      if (this.required) {
        rules.push((v) => !!v || 'required');
      }

      if (!this.allowPastDates) {
        rules.push((v) => {
          if (!v) return true; // Let required rule handle empty values

          // Handle both single date and date range formats
          const dateParts = v.split(' to ');
          const dateToCheck = dateParts[0]; // Check the first/start date

          if (!dateToCheck) return true;

          const selectedDate = moment(dateToCheck, 'DD/MM/YYYY').startOf('day');
          const today = moment().startOf('day');

          return !selectedDate.isBefore(today) || 'Date cannot be in the past';
        });
      }

      return rules;
    }
  },
  methods: {
    openDatePicker() {
      if (this.modelValue) {
        if (this.modelValue.includes(' to ')) {
          // Handle date range
          const dateParts = this.modelValue.split(' to ');
          const startDate = moment(dateParts[0], 'DD/MM/YYYY');
          const endDate = moment(dateParts[1], 'DD/MM/YYYY');

          // Verify that dateRange matches the current display
          if (this.dateRange && this.dateRange.length > 0) {
            const rangeStart = moment(this.dateRange[0]);
            const rangeEnd = moment(this.dateRange[this.dateRange.length - 1]);

            // Check if dateRange matches current display
            if (rangeStart.isSame(startDate, 'day') && rangeEnd.isSame(endDate, 'day')) {
              // Convert to Date objects for Vuetify compatibility
              this.selectedDate = this.dateRange.map((date) => new Date(date));
            } else {
              // Generate fresh range if dateRange doesn't match
              const dateRange = [];
              const current = moment(startDate);

              while (current.isSameOrBefore(endDate)) {
                dateRange.push(new Date(current.toDate()));
                current.add(1, 'day');
              }

              this.selectedDate = dateRange;
            }
          } else {
            // Generate complete date range for editing
            const dateRange = [];
            const current = moment(startDate);

            while (current.isSameOrBefore(endDate)) {
              dateRange.push(new Date(current.toDate()));
              current.add(1, 'day');
            }

            this.selectedDate = dateRange;
          }
        } else {
          // Handle single date
          this.selectedDate = [new Date(moment(this.modelValue, 'DD/MM/YYYY').toDate())];
        }
      } else {
        this.selectedDate = [];
      }

      this.datePickerDialog = true;
    },

    confirmDatePicker() {
      if (this.selectedDate && this.selectedDate.length > 0) {
        // Handle different data formats from Vuetify date picker
        let dateArray = [];

        if (Array.isArray(this.selectedDate)) {
          // Convert Date objects to YYYY-MM-DD strings
          dateArray = this.selectedDate.map((date) => {
            if (date instanceof Date) {
              return moment(date).format('YYYY-MM-DD');
            } else if (typeof date === 'string') {
              return moment(date).format('YYYY-MM-DD');
            } else {
              return moment(date).format('YYYY-MM-DD');
            }
          });
        } else if (typeof this.selectedDate === 'string') {
          dateArray = [moment(this.selectedDate).format('YYYY-MM-DD')];
        } else if (this.selectedDate instanceof Date) {
          dateArray = [moment(this.selectedDate).format('YYYY-MM-DD')];
        } else {
          console.error('Unexpected selectedDate format:', this.selectedDate);
          return;
        }

        // Sort dates properly using moment for accurate date comparison
        const sortedDates = dateArray.sort((a, b) => {
          return moment(a).valueOf() - moment(b).valueOf();
        });

        if (sortedDates.length === 1) {
          // Single date selected
          const date = moment(sortedDates[0]).format('DD/MM/YYYY');
          this.$emit('update:modelValue', date);
          this.$emit('update:dateFrom', sortedDates[0]);
          this.$emit('update:dateTo', sortedDates[0]);
          this.$emit('update:dateRange', [sortedDates[0]]);
        } else if (sortedDates.length === 2) {
          // Range with start and end date
          const startDate = moment(sortedDates[0]).format('DD/MM/YYYY');
          const endDate = moment(sortedDates[1]).format('DD/MM/YYYY');
          this.$emit('update:modelValue', `${startDate} to ${endDate}`);
          this.$emit('update:dateFrom', sortedDates[0]);
          this.$emit('update:dateTo', sortedDates[1]);

          // Generate complete date range
          const start = moment(sortedDates[0]);
          const end = moment(sortedDates[1]);
          const dateRange = [];

          while (start.isSameOrBefore(end)) {
            dateRange.push(start.format('YYYY-MM-DD'));
            start.add(1, 'day');
          }

          this.$emit('update:dateRange', dateRange);
        } else {
          // Multiple individual dates selected
          const startDate = moment(sortedDates[0]).format('DD/MM/YYYY');
          const endDate = moment(sortedDates[sortedDates.length - 1]).format('DD/MM/YYYY');
          this.$emit('update:modelValue', `${startDate} to ${endDate}`);
          this.$emit('update:dateFrom', sortedDates[0]);
          this.$emit('update:dateTo', sortedDates[sortedDates.length - 1]);
          this.$emit('update:dateRange', sortedDates);
        }
      }
      this.datePickerDialog = false;
    },

    cancelDatePicker() {
      this.datePickerDialog = false;
      this.selectedDate = [];
    }
  }
};
</script>

