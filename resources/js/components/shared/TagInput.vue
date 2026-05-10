<script setup lang="ts">
import { ref, nextTick } from 'vue';

const tags = defineModel<string[]>({ required: true });

interface Props {
  variant?: 'filled' | 'outlined' | 'plain' | 'underlined' | 'solo' | 'solo-inverted' | 'solo-filled' | 'tonal';
  placeholder?: string;
  density?: 'default' | 'comfortable' | 'compact';
}

withDefaults(defineProps<Props>(), {
  variant: 'outlined',
  placeholder: 'Service Tag',
  density: 'comfortable',
});

const combobox = ref<any>(null);

// Menangani paste text (memisahkan berdasarkan koma atau spasi)
const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault();
  const pastedText = e.clipboardData?.getData('text') || '';
  const newTags = pastedText
    .split(/[,\s]+/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  newTags.forEach((tag) => {
    // Izinkan duplikat: hapus pengecekan !tags.value.includes(tag)
    tags.value.push(tag);
  });
};

// Menangani update pencarian (input manual)
const handleSearchUpdate = (val: string) => {
  if (val && /[,\s]/.test(val)) {
    const newTags = val
      .split(/[,\s]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    newTags.forEach((tag) => {
      // Izinkan duplikat: hapus pengecekan !tags.value.includes(tag)
      tags.value.push(tag);
    });

    nextTick(() => {
      if (combobox.value) {
        combobox.value.search = '';
        combobox.value.isFocused = false;
      }
    });
  }
};

// Menghapus tag
const removeTag = (index: number) => {
  tags.value.splice(index, 1);
  nextTick(() => {
    if (combobox.value) {
      combobox.value.search = '';
      const input = combobox.value.$el.querySelector('input');
      if (input) {
        input.focus();
      }
    }
  });
};
</script>

<template>
  <v-combobox
    v-model="tags"
    :variant="variant"
    :placeholder="placeholder"
    :density="density"
    single-line
    multiple
    hide-details
    :chips="true"
    :closable-chips="true"
    role="combobox"
    :return-object="false"
    class="service-tag-input"
    :delimiters="[',']"
    @paste="handlePaste"
    @update:search="handleSearchUpdate"
    ref="combobox"
    spellcheck="false"
  >
    <template v-slot:chip="{ item, index }">
      <v-chip
        label
        variant="tonal"
        color="primary"
        rounded="lg"
        size="small"
        closable
        @click:close="removeTag(index)"
      >
        {{ typeof item === 'object' ? item.title : item }}
      </v-chip>
    </template>
  </v-combobox>
</template>
