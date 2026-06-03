<script setup lang="ts">

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
});
</script>

<template>
    <v-row>
        <v-col cols="12">
            <!-- <h5 class="text-h5 mb-4">Features</h5>
            <v-divider></v-divider> -->
            <p class="v-col-lg-10 px-0 mb-0 text-h6 text-lightText" style="white-space: pre-line">
                {{ props.content }}
            </p>
        </v-col>
    </v-row>
</template>