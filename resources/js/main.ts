import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import { useAuthStore } from "@/stores/auth";
import { useAccessStore } from "@/stores/user-management/access-store";
import vuetify from "./plugins/vuetify";
import Permission from "./plugins/permissions";
import DateField from "./components/shared/DateField.vue";

// Vue Flow styles (import before app styles so custom vars override)
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";

import "./scss/style.scss";
// Comment out imports that might be missing
import { PerfectScrollbarPlugin } from "vue3-perfect-scrollbar";
import VueApexCharts from "vue3-apexcharts";
import VueTablerIcons from "vue-tabler-icons";
import Vue3Marquee from "vue3-marquee";

import SvgSprite from "./components/shared/SvgSprite.vue";
import TagInput from "./components/shared/TagInput.vue";

import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";

// google-fonts
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/700.css";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/500.css";
import "@fontsource/public-sans/600.css";
import "@fontsource/public-sans/700.css";

//Mock Api data
// import "./_mockApis";
// import { fakeBackend } from "./utils/helpers/fake-backend";
// PWA service worker registration
import { registerSW } from 'virtual:pwa-register';

import { vMaska } from "maska/vue";
// print
import print from "vue3-print-nb";
// Table
import Vue3EasyDataTable from "vue3-easy-data-table";
//i18
import { createI18n } from "vue-i18n";
import messages from "./utils/locales/messages";
import VueSweetalert2 from "vue-sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
//moment
import moment from "moment";
const i18n = createI18n({
  legacy: true, // tetap gunakan legacy agar $t di template bekerja
  allowComposition: true, // izinkan Composition API (useI18n) di legacy mode
  locale: "en",
  messages: messages,
  // opsi warning lama tidak digunakan di v9, jika ingin menonaktifkan:
  // missingWarn: false,
  // fallbackWarn: false,
  globalInjection: true,
});

const app = createApp(App);
// fakeBackend();

// Register the service worker for PWA support
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    swUrl: '/build/sw.js',
    scope: '/',
    onNeedRefresh() {
      // trigger a lightweight UI refresh indicator
      window.dispatchEvent(new Event('softrefresh'));
    },
    onOfflineReady() {
      console.log('PWA is ready to work offline');
    }
  });
}

// Add CSRF token to all axios requests
import axios from 'axios';
import './echo';
import permissions from "./plugins/permissions";
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
  axios.defaults.headers.common['X-CSRF-TOKEN'] = token.getAttribute('content');
} else {
  console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}
app.config.globalProperties.filters = {
  date(value: any) {
    // moment.locale("id");
    // return moment(value).format("D MMM YYYY");
    return value;
  },
  dateTime(value: any) {
    // moment.locale("id");
    // return moment(value).format("D MMM YYYY H:mm");
    return value;
  },
  dateAsia(value: any) {
    // moment.locale("id");
    // return moment(value).format("DD MMM YYYY");
    return value;
  },
  formatMoney(value: any, useSymbol = true, currency: any,) {
    if (currency) {
      currency = currency;
    } else {
      currency = "IDR";
    }
    let formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);

    if (!useSymbol) {
      // Hilangkan "Rp" dari hasil format
      formatted = formatted.replace(/^Rp\s?/, '');
    }
    return formatted;
  },
  formatNumber(value: number) {
    if (!value && value !== 0) return "0";
    const [intPart, decPart] = value.toString().split('.');
    const formattedInt = new Intl.NumberFormat("id-ID").format(parseInt(intPart));
    if (decPart) {
      // Limit decimal to 2 digits
      const limitedDecimal = decPart.slice(0, 2);
      return `${formattedInt},${limitedDecimal}`;
    }
    return formattedInt;
  },
  unformatNumber(value: string) {
    if (!value) return 0;
    // Convert from Indonesian format (1.234,56) to standard number (1234.56)
    const cleanValue = value.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleanValue) || 0;
    // Round to 2 decimal places
    return Math.round(num * 100) / 100;
  },
  handleNumberInput(value: string, callback: (val: number) => void) {
    // Allow numbers and single comma with max 2 decimal digits
    if (/^[0-9.]*,?[0-9]{0,2}$/.test(value)) {
      const numVal = this.unformatNumber(value);
      callback(numVal);
    }
  },
  preventNonNumeric(e: KeyboardEvent) {
    // Allow numbers, comma, and control keys
    if (!/[0-9,]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      e.preventDefault();
    }
    // Prevent multiple commas
    if (e.key === ',' && (e.target as HTMLInputElement).value.includes(',')) {
      e.preventDefault();
    }
    // Prevent more than 2 decimal digits
    const input = e.target as HTMLInputElement;
    const commaIndex = input.value.indexOf(',');
    if (commaIndex !== -1 && input.value.length > commaIndex + 2 &&
        e.key !== 'Backspace' && e.key !== 'Delete' &&
        input.selectionStart! > commaIndex) {
      e.preventDefault();
    }
  },

  // ini adalah contoh dari format Rp 100.000,00
  // <v-text-field
  //   variant="outlined"
  //   aria-label="price"
  //   type="text"
  //   single-line
  //   hide-details
  //   density="comfortable"
  //   :model-value="filters.formatNumber(item.price)"
  //   ./update:model-value="(val) => filters.handleNumberInput(val, (num) => item.price = num)"
  //   ./keypress="filters.preventNonNumeric"
  //   prefix="Rp "
  // ></v-text-field>
};

// Make sure i18n is installed before other components that might use it
app.use(i18n);
const pinia = createPinia();
app.use(pinia);
app.use(permissions);
app.use(router);

// Initialize access store from auth store if user is already logged in (e.g. on page refresh)
// We need to use store AFTER Pinia is installed
const authStore = useAuthStore(pinia);
if (authStore.user) {
  const accessStore = useAccessStore(pinia);
  accessStore.setAccess(authStore.user.role, authStore.user.permission_list || []);

  // Initialize broadcasting for existing user
  authStore.initBroadcasting();

  // Fetch fresh profile to update permissions
  authStore.fetchProfile();
}

app.use(VueSweetalert2);
app.component("EasyDataTable", Vue3EasyDataTable);
app.use(PerfectScrollbarPlugin);
app.component("DateField", DateField);
app.component("SvgSprite", SvgSprite);
app.component("ServiceTagInput", TagInput);
app.use(VueTablerIcons);
app.use(print);
app.use(Vue3Marquee);
app.directive("maska", vMaska);
app.use(VueApexCharts);
app.use(Permission);
app.use(vuetify).mount("#app");
