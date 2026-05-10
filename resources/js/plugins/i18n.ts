import { createI18n } from 'vue-i18n';

// Define your translations
const messages = {
  en: {
    menu: {
      dashboard: 'Dashboard',
      apps: 'Apps',
      pages: 'Pages',
      authentication: 'Authentication',
      utility: 'Utility',
      widgets: 'Widgets',
      forms: 'Forms',
      charts: 'Charts',
      tables: 'Tables',
      ui: 'UI Elements',
      others: 'Others',
      landing: 'Landing',
      more: 'More'
    },
    // Add more translations as needed
  },
  // Add more languages as needed
};

// Create i18n instance
const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: 'en', // Set default locale
  fallbackLocale: 'en',
  messages,
});

export default i18n;
