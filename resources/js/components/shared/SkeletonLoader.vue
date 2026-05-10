<script>
export default {
  props: {
    type: {
      type: String
    }
  },
  data() {
    return {};
  }
};
</script>
<template>
  <v-skeleton-loader type="table-row@8" class="mb-2" v-if="type === 'List'"></v-skeleton-loader>
  <v-card variant="outlined" class="bg-surface mb-5" rounded="lg" v-else>
    <v-card-item class="px-0">
      <!-- Header skeleton -->
      <div class="bg-containerBg pa-2 rounded-lg mx-6">
        <v-row>
          <v-col class="text-end">
            <v-skeleton-loader type="button"></v-skeleton-loader>
          </v-col>
        </v-row>
      </div>
      <v-row class="mt-6 mx-0 px-3">
        <!-- Left column skeleton -->
        <v-col cols="12" sm="6">
          <v-skeleton-loader type="image, text, text, text" class="mb-4"></v-skeleton-loader>
        </v-col>

        <!-- Right column skeleton -->
        <v-col cols="12" sm="6">
          <v-skeleton-loader type="text, text, text, text" class="mb-4"></v-skeleton-loader>
        </v-col>
        <!-- Customer info skeleton -->
        <v-col cols="12" sm="6">
          <v-card variant="outlined" rounded="lg">
            <v-card-item>
              <v-skeleton-loader type="heading, text@2"></v-skeleton-loader>
            </v-card-item>
          </v-card>
        </v-col>

        <!-- Approve by skeleton -->
        <v-col cols="12" sm="6">
          <v-card variant="outlined" rounded="lg">
            <v-card-item>
              <v-skeleton-loader type="heading, text@2"></v-skeleton-loader>
            </v-card-item>
          </v-card>
        </v-col>

        <v-col cols="12">
          <v-card variant="outlined" rounded="lg">
            <v-card-item>
              <v-skeleton-loader type="heading, text@2"></v-skeleton-loader>
            </v-card-item>
          </v-card>
        </v-col>
        <!-- Table skeleton -->
        <v-col cols="12" class="pb-0">
          <v-divider></v-divider>
          <v-skeleton-loader type="heading, text@2" class="mt-4"></v-skeleton-loader>
        </v-col>

        <v-divider class="my-4"></v-divider>

        <!-- Total section skeleton -->
        <v-col cols="12" sm="5" md="4" class="ms-auto">
          <v-skeleton-loader type="list-item-three-line"></v-skeleton-loader>
        </v-col>

        <!-- Notes skeleton -->
        <v-col cols="12">
          <v-skeleton-loader type="text"></v-skeleton-loader>
        </v-col>
      </v-row>
    </v-card-item>
  </v-card>
</template>
