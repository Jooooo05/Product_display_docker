<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="{{ asset('/assets/images/favicon.png') }}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="msapplication-TileColor" content="#F8F9FA" id="tile-color-meta" />
    <meta name="theme-color" content="#F8F9FA" id="theme-color-meta" />
    <!-- PWA manifest and Apple tags -->
    <!-- Use built manifest so it’s same-origin with Laravel server -->
    <link rel="manifest" href="{{ asset('build/manifest.webmanifest') }}">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default" id="apple-status-bar-style-meta">
    <link rel="apple-touch-icon" href="{{ asset('icons/apple-icon-180.png') }}">
    <title>{{ config('app.name', 'Product Display ') }}</title>
    @vite(['resources/js/main.ts', 'resources/js/assets/fonts/inter.css'])
  </head>
  <body>
    <div id="app"></div>
    <style>
      /* Ensure the page background matches the active Vuetify theme */
      html, body { background-color: rgb(var(--v-theme-containerBg)); }
      /* iOS safe-area background for notch devices */
      .safe-area-bg { background-color: rgb(var(--v-theme-containerBg)); }
    </style>
    <script>
      // Update meta tags based on theme
      function updateMetaTags() {
        const themeColorMeta = document.getElementById('theme-color-meta');
        const tileColorMeta = document.getElementById('tile-color-meta');
        const appleStatusMeta = document.getElementById('apple-status-bar-style-meta');

        // Detect theme by scanning Vuetify theme classes anywhere in the app
        const themeEls = document.querySelectorAll('.v-theme--dark, .v-theme--light');
        let isDarkTheme;
        if (themeEls.length > 0) {
          isDarkTheme = Array.from(themeEls).some((el) => el.classList.contains('v-theme--dark'));
        } else {
          // Fallback if classes are not found
          const storedTheme = localStorage.getItem('theme');
          isDarkTheme = storedTheme === 'dark';
        }

        // Colors align with containerBg in vuetify.ts
        const containerBgColor = isDarkTheme ? '#131920' : '#F8F9FA';

        // Some browsers (iOS Safari) don't always reflect dynamic changes to existing meta.
        // Recreate the tag to force refresh.
        if (themeColorMeta) {
          const newMeta = document.createElement('meta');
          newMeta.setAttribute('name', 'theme-color');
          newMeta.setAttribute('content', containerBgColor);
          newMeta.id = 'theme-color-meta';
          document.head.appendChild(newMeta);
          themeColorMeta.remove();
        } else {
          const newMeta = document.createElement('meta');
          newMeta.setAttribute('name', 'theme-color');
          newMeta.setAttribute('content', containerBgColor);
          newMeta.id = 'theme-color-meta';
          document.head.appendChild(newMeta);
        }

        if (tileColorMeta) tileColorMeta.setAttribute('content', containerBgColor);

        // For iOS standalone PWA
        if (appleStatusMeta) {
          appleStatusMeta.setAttribute('content', isDarkTheme ? 'black' : 'default');
        }
      }

      // Initial update
      document.addEventListener('DOMContentLoaded', updateMetaTags);

      // Watch for theme class changes on multiple roots
      const observer = new MutationObserver(function(mutations) {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            updateMetaTags();
          }
        }
      });

      document.addEventListener('DOMContentLoaded', function() {
        const appEl = document.getElementById('app');
        const targets = [appEl, document.body, document.documentElement].filter(Boolean);
        targets.forEach((target) => {
          observer.observe(target, { attributes: true, attributeFilter: ['class'], subtree: true, childList: true });
        });
        // Optional: react to custom events from components
        window.addEventListener('themechange', updateMetaTags);
      });
    </script>
  </body>
</html>
