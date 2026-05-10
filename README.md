# Able Pro Laravel Starter Kit

A modern web application built with Laravel 12 and Vue 3 + Vuetify.

## Features

- Modern Laravel 12 backend
- Vue 3 frontend with TypeScript
- Vuetify UI components
- Pinia for state management
- Vue Router for navigation
- i18n for internationalization
- ApexCharts for data visualization
- Form validation with Vee-Validate
- **User & Role Management** 
- Real-time WebSockets with Laravel Reverb

## User & Role Management

This starter kit includes a comprehensive User and Role management module.

### Capabilities
- **User Administration**: 
  - Full CRUD operations for users.
  - Role assignment during user creation/editing.
  - Search and pagination support.
- **Role & Permission System**: 
  - Create and manage roles.
  - Assign granular permissions to roles.
- Access Control:
  - `v-permission` directive (e.g., `v-permission="'user.create'"` or `v-permission="['user.create', 'user.edit']"`) to control UI element visibility.
  - Route-level protection based on authentication state.
- Authentication:
  - Integrated Pinia stores (`auth`, `user`, `role`, `access`).
  - Axios interceptors for automatic token injection and error handling (401/403).

### Using v-permission Directive

The `v-permission` directive is a powerful tool for controlling the visibility of UI elements based on the user's permissions.

**Usage:**

```html
<!-- Single Permission -->
<button v-permission="'user.create'">Create User</button>

<!-- Multiple Permissions (OR condition) -->
<button v-permission="['user.create', 'user.edit']">Manage User</button>
```

**How it works:**
The directive checks the user's permissions stored in the `access-store`. If the user does not have the required permission(s), the element is removed from the DOM.

### Tips for Creating CRUD Module

To create a new CRUD module (e.g., "Product Management"), follow these steps:

#### Backend (Laravel)

1.  **Create Migration & Model**:
    ```bash
    php artisan make:model Product -m
    ```
2.  **Create Controller**:
    ```bash
    php artisan make:controller ProductController --api
    ```
3.  **Define Routes**:
    Add routes in `routes/api.php`.
    ```php
    Route::apiResource('products', ProductController::class);
    ```
4.  **Register Permissions**:
    Add new permissions in `database/seeders/RolePermissionSeeder.php` (e.g., `product.create`, `product.read`, `product.edit`, `product.delete`) and run the seeder.
    ```bash
    php artisan db:seed --class=RolePermissionSeeder
    ```

#### Frontend (Vue + Pinia)

1.  **Create Store**:
    Create `resources/js/stores/product-store.ts`. Use `user-store.ts` as a template.
2.  **Create Components**:
    Create a folder `resources/js/views/pages/product`.
    - `ProductList.vue`: List view with `v-data-table`.
    - `ProductCreate.vue` / `ProductEdit.vue`: Form views.
3.  **Define Routes**:
    Create `resources/js/router/ModulRoutes/product-route.ts`.
    ```typescript
    const productRoutes = {
        path: '/product',
        component: () => import('@/layouts/dashboard/DashboardLayout.vue'),
        children: [
            {
                path: 'list',
                name: 'ProductList',
                component: () => import('@/views/pages/product/ProductList.vue'),
                meta: {
                    requiresAuth: true,
                    title: 'Product List',
                    permissions: ['product.read'] // Route-level protection
                }
            }
        ]
    };
    export default productRoutes;
    ```
4.  **Add to Sidebar**:
    Update `resources/js/layouts/dashboard/vertical-sidebar/sidebarItem.ts`.
    ```typescript
    {
        title: 'Product Management',
        icon: 'custom-box',
        to: '/product/list',
        permissions: ['product.read'] // Menu visibility
    }
    ```

## Requirements

- PHP 8.2+
- Node.js
- Composer

## Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd <project-folder>
   ```

2. Install PHP dependencies
   ```
   composer install
   ```

3. Install JavaScript dependencies
   ```
   npm install
   ```

4. Copy the environment file
   ```
   cp .env.example .env
   ```
   **Important**: Update `VITE_API_URL` in `.env` if your API is not at `http://localhost/api`.

5. Generate application key
   ```
   php artisan key:generate
   ```

6. Configure your database in the `.env` file

7. Run migrations
   ```
   php artisan migrate
   ```

## WebSockets Setup (Laravel Reverb)

This project uses Laravel Reverb for real-time WebSockets communication. To set it up:

1. Ensure your `.env` file has the correct Reverb configuration variables (this is usually pre-configured when copying `.env.example`).
2. Start the Reverb server by running the following command:
   ```bash
   php artisan reverb:start
   ```

## Development

After starting the Reverb server, run the development server in a separate terminal:

```bash
composer run dev
```

This command runs:
- Laravel development server
- Queue worker
- Laravel Pail for logs
- Vite development server

## Building for Production

```
npm run build
```

## Technologies Used

- [Laravel 12](https://laravel.com)
- [Vue 3](https://vuejs.org)
- [Vuetify](https://vuetifyjs.com)
- [Pinia](https://pinia.vuejs.org)
- [Vue Router](https://router.vuejs.org)
- [TypeScript](https://www.typescriptlang.org)
- [ApexCharts](https://apexcharts.com)
- [Vite](https://vitejs.dev)

## Laravel Packages

- Laravel Sail
- Laravel Pail
- Laravel Tinker

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
