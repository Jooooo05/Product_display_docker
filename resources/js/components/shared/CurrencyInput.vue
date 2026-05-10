<script>
export default {
  name: 'CurrencyInput',
  props: {
    modelValue: {
      type: [Number, String],
      default: 0
    },
    min: {
      type: Number,
      default: undefined
    },
    max: {
      type: Number,
      default: undefined
    },
    label: {
      type: String,
      default: ''
    },
    prefix: {
      type: String,
      default: ''
    },
    density: {
      type: String,
       default: 'compact'
    },
    variant: {
      type: String,
         default: 'filled'
    },
    placeholder: {
      type: String,
      default: ''
    },
    hideDetails: {
      type: [Boolean, String],
      default: false
    },
     singleLine: {
      type: [Boolean, String],
      default: false
    },
    currency: {
      type: String,
      default: 'IDR'
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      forceKey: 0
    }
  },
  computed: {
    formattedValue() {
      return this.formatNumber(this.modelValue);
    }
  },
  methods: {
    formatNumber(value) {
      if (!value && value !== 0) return "0";
      const [intPart, decPart] = value.toString().split('.');
      const formattedInt = new Intl.NumberFormat("id-ID").format(parseInt(intPart));
      if (decPart) {
        const limitedDecimal = decPart.slice(0, 2);
        return `${formattedInt},${limitedDecimal}`;
      }
      return formattedInt;
    },
    unformatNumber(value) {
      if (!value) return 0;
      const cleanValue = value.toString().replace(/\./g, '').replace(',', '.');
      const num = parseFloat(cleanValue) || 0;
      return Math.round(num * 100) / 100;
    },
    handleInput(value) {
      // Allow numbers and single comma with max 2 decimal digits
      if (/^[0-9.]*,?[0-9]{0,2}$/.test(value)) {
        const numVal = this.unformatNumber(value);
        if (Number.isFinite(this.min) && numVal < this.min) {
          this.$emit('update:modelValue', this.min);
          this.forceKey++;
          return;
        }
        if (Number.isFinite(this.max) && numVal > this.max) {
          this.$emit('update:modelValue', this.max);
          this.forceKey++;
          return;
        }
        this.$emit('update:modelValue', numVal);
      }
    },
    preventNonNumeric(e) {
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
      if (!/[0-9,.]/.test(e.key) && !allowedKeys.includes(e.key)) {
        e.preventDefault();
      }
      const selectionStart = e.target?.selectionStart;
      const selectionEnd = e.target?.selectionEnd;
      const hasSelection = typeof selectionStart === 'number' && typeof selectionEnd === 'number' && selectionStart !== selectionEnd;
      const current = Number(this.modelValue);
      const atMax = Number.isFinite(this.max) && Number.isFinite(current) && current >= this.max;
      if (atMax && !hasSelection && /[0-9,.]/.test(e.key)) {
        e.preventDefault();
        this.forceKey++;
        return;
      }
      if (e.key === ',' && e.target.value.includes(',')) {
        e.preventDefault();
      }
      const input = e.target;
      const commaIndex = input.value.indexOf(',');
      if (commaIndex !== -1 && input.value.length > commaIndex + 2 &&
          e.key !== 'Backspace' && e.key !== 'Delete' &&
          input.selectionStart > commaIndex) {
        e.preventDefault();
      }
    }
  }
}
</script>

<template>
  <v-text-field
    :key="forceKey"
    :variant="variant"
    :label="label"
    :placeholder="placeholder"
    type="text"
    :density="density"
    :model-value="formattedValue"
    @update:model-value="handleInput"
    @keypress="preventNonNumeric"
    @focus="$event.target.select()"
    :hide-details="hideDetails"
    :single-line="singleLine"
  >
    <template v-slot:prepend-inner>
      <span class="text-body-1 font-weight-medium text-secondary">{{ prefix }}</span>
    </template>

  </v-text-field>
</template>
