<template>
  <!-- -------------------------------------------------------------------- -->
  <!-- Data Table Card -->
  <!-- -------------------------------------------------------------------- -->
  <v-card elevation="0" variant="outlined" class="bg-surface overflow-hidden" rounded="lg">
          <v-card-item>
          <v-row justify-md="space-between" class="align-center">
            <v-col cols="12" md="3">
                <slot name="search"/>
            </v-col>
            <v-col cols="12" md="3">
              <div class="d-flex ga-2 justify-md-end justify-center">
                <slot name="header"></slot>
              </div>
            </v-col>
          </v-row>
        </v-card-item>
        <v-divider></v-divider>
        <v-card-text class="pa-0">
            <slot></slot>
        </v-card-text>
        <v-card-actions v-if="$slots.pagination || $slots.paginationDetail">
            <v-row justify="space-between" class="align-center">
            <v-col cols="12" md="3">
                <slot name="pagination"/>
            </v-col>
            <v-col cols="12" md="3">
              <div class="d-flex ga-2 justify-md-end justify-center">
                <slot name="paginationDetail"></slot>
              </div>
            </v-col>
          </v-row>
        </v-card-actions>
    </v-card>
</template>
