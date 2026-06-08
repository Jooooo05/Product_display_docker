<script>
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { mapState } from 'pinia';
import { useAuthStore } from '@/stores/auth';
export default {
  components: {
    UiParentCard
  },
  computed: {
    ...mapState(useAuthStore, ['isLoadingUniversal']),
  }
};
</script>
<template>
  <v-dialog v-model="isLoadingUniversal" max-width="120px" persistent>
    <v-card>
      <v-card-text>
        <div class="d-flex flex-column flex-sm-row align-center ga-4 justify-center">
          <div>
            <v-progress-circular
              aria-label="circular progressbar"
              size="75"
              indeterminate
              color="primary"
              bg-opacity="1"
              bg-color="borderLight"
            >
            </v-progress-circular>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
