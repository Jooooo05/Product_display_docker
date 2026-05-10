<script>
import SvgSprite from './SvgSprite.vue'

/**
 * Komponen QtySelector
 *
 * Digunakan untuk mengatur jumlah (kuantitas) dengan tombol tambah (+) dan kurang (-),
 * serta mendukung input angka langsung secara manual.
 *
 * ==========================================
 * CARA PENGGUNAAN (EXAMPLES)
 * ==========================================
 *
 * 1. Penggunaan Dasar (Standard v-model):
 *    <QtySelector v-model="item.qty" />
 *
 * 2. Hanya mengizinkan bilangan bulat (Tanpa Desimal):
 *    <QtySelector v-model="item.qty" :allowDecimal="false" />
 *
 * 3. Membatasi klik tombol (Maksimal Stok / Minimal Beli):
 *    <QtySelector
 *      v-model="item.qty"
 *      :disabledDecrement="item.qty <= 1"
 *      :disabledIncrement="item.qty >= item.maxStock"
 *    />
 *
 * 4. Menangkap Event (Listener):
 *    <QtySelector
 *      v-model="item.qty"
 *      @change="onQtyChange"
 *      @increment="onIncrement"
 *      @decrement="onDecrement"
 *    />
 *
 * ==========================================
 * PROPS
 * ==========================================
 * @prop {Number} modelValue - Nilai kuantitas saat ini untuk sinkronisasi v-model (Default: 1)
 * @prop {Boolean} allowDecimal - Apakah input desimal diperbolehkan (Default: true)
 * @prop {Boolean} disabledDecrement - Menonaktifkan tombol kurang (-) (Default: false)
 * @prop {Boolean} disabledIncrement - Menonaktifkan tombol tambah (+) (Default: false)
 *
 * ==========================================
 * EMITS (EVENTS)
 * ==========================================
 * @emit update:modelValue - (value) Dipicu secara otomatis untuk memperbarui v-model
 * @emit increment - (value) Dipicu setelah tombol tambah (+) berhasil diklik
 * @emit decrement - (value) Dipicu setelah tombol kurang (-) berhasil diklik
 * @emit change - (value) Dipicu setiap kali nilai berubah (baik lewat tombol maupun ketikan manual)
 */
export default {
  name: 'QtySelector',
  components: { SvgSprite },
  props: {
    modelValue: {
      type: Number,
      default: 1
    },
    allowDecimal: {
      type: Boolean,
      default: true
    },
    disabledDecrement: {
      type: Boolean,
      default: false
    },
    disabledIncrement: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'increment', 'decrement', 'change'],
  computed: {
    inputValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        const text = (value ?? '').toString().trim()
        if (text === '') {
          this.$emit('update:modelValue', 0)
          this.$emit('change', 0)
          return
        }

        if (!this.allowDecimal) {
          const digitsOnly = text.replace(/[^\d]/g, '')
          const parsedInt = digitsOnly === '' ? 0 : Number(digitsOnly)
          if (!Number.isFinite(parsedInt)) return
          const val = Math.max(0, Math.trunc(parsedInt))
          this.$emit('update:modelValue', val)
          this.$emit('change', val)
          return
        }

        const normalized = text.replace(/,/g, '.')
        const parsed = Number(normalized)
        if (!Number.isFinite(parsed)) return
        const val = Math.max(0, parsed)
        this.$emit('update:modelValue', val)
        this.$emit('change', val)
      }
    }
  },
  methods: {
    increment() {
      if (!this.disabledIncrement) {
        const newValue = this.modelValue + 1;
        this.$emit('update:modelValue', newValue);
        this.$emit('increment', newValue);
        this.$emit('change', newValue);
      }
    },
    decrement() {
      if (!this.disabledDecrement && this.modelValue > 0) {
        const newValue = Math.max(0, this.modelValue - 1);
        this.$emit('update:modelValue', newValue);
        this.$emit('decrement', newValue);
        this.$emit('change', newValue);
      }
    },
    onInput(value) {
      this.inputValue = value
    }
  }
}
</script>

<template>
  <v-btn-toggle variant="outlined" divided color="primary" class="w-100">
    <v-btn
      size="small"
      color="primary"
      aria-label="remove"
      style="min-width: unset"
      variant="tonal"
      @click="decrement"
      :disabled="disabledDecrement || modelValue <= 0"
    >
      <SvgSprite name="custom-line" :class="(disabledDecrement || modelValue <= 0) ? '' : 'text-primary'" style="width: 18px; height: 18px" />
    </v-btn>

    <v-text-field
      :model-value="inputValue"
      @update:modelValue="onInput"
      type="number"
      :step="allowDecimal ? 'any' : '1'"
      :inputmode="allowDecimal ? 'decimal' : 'numeric'"
      rounded="0"
      density="comfortable"
      class="centered-input responsive-qty-input"
      hide-details
    />

    <v-btn
      size="small"
      aria-label="add"
      color="primary"
      style="min-width: unset"
      variant="tonal"
      @click="increment"
      :disabled="disabledIncrement"
    >
      <SvgSprite name="custom-plus" class="text-primary" style="width: 18px; height: 18px" />
    </v-btn>
  </v-btn-toggle>
</template>

<style scoped>
.centered-input :deep(input) {
  text-align: center;
  padding: 0;
}

/* Responsivitas Lebar Input */
.responsive-qty-input {
  width: 60px; /* Default untuk HP */
}

@media (min-width: 600px) { /* Tablet */
  .responsive-qty-input {
    width: 80px;
  }
}

@media (min-width: 1280px) { /* Desktop */
  .responsive-qty-input {
    width: 100px;
  }
}

/* Menghilangkan arrow up/down (spinners) */
.centered-input :deep(input::-webkit-outer-spin-button),
.centered-input :deep(input::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

.centered-input :deep(input[type=number]) {
  -moz-appearance: textfield;
}
</style>
