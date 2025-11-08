# TODO: Create Custom Exception Handler for API Responses

- [x] Create `app/Exceptions/ApiException.php` - Custom exception class extending Exception with message and status code
- [x] Edit `bootstrap/app.php` - Add handling for ApiException in withExceptions closure to return JSON for API routes
- [x] Test the implementation by throwing ApiException in a controller and verifying JSON response

# TODO: Create Standardized API Response Format

- [x] Create `app/Http/Controllers/ApiResponseTrait.php` - Trait with success() and error() methods for consistent JSON responses
- [x] Update `app/Http/Controllers/Controller.php` - Add use ApiResponseTrait to base controller
- [x] Update all controllers to use $this->success() and $this->error() instead of direct response()->json()
- [x] Update `bootstrap/app.php` - Ensure ApiException responses follow standardized format
- [x] Test API endpoints to ensure standardized responses

# TODO: Add Seeders and Factories for Test Data

- [x] Create `database/factories/TransactionFactory.php` - Factory to generate fake transactions with user_id, type, amount, description, date, category_id
- [x] Create `database/factories/BudgetFactory.php` - Factory to generate fake budgets with user_id, name, amount, category_id, start_date, end_date
- [x] Create `database/factories/SavingFactory.php` - Factory to generate fake savings with user_id, name, target_amount, current_amount, description
- [x] Update `database/seeders/DatabaseSeeder.php` - Modify to create multiple users and associate transactions, budgets, and savings
- [x] Run `php artisan db:seed` to populate the database with test data
- [x] Verify the seeded data in the database

# TODO: Create Swagger/OpenAPI Documentation

- [ ] Install `darkaonline/l5-swagger` package in `composer.json`
- [ ] Run `composer install` to install the package
- [ ] Publish Swagger config with `php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"`
- [ ] Add OpenAPI annotations to `AuthController.php` for register, login, logout endpoints
- [ ] Add OpenAPI annotations to `TransactionController.php` for CRUD and monthly summary endpoints
- [ ] Add OpenAPI annotations to `BudgetController.php` for CRUD endpoints
- [ ] Add OpenAPI annotations to `SavingController.php` for CRUD endpoints
- [ ] Add OpenAPI annotations to `ForgotPasswordController.php` for password reset endpoints
- [ ] Add OpenAPI annotations to `GoogleAuthController.php` for OAuth endpoints
- [ ] Add schema annotations to `User.php`, `Transaction.php`, `Budget.php`, `Saving.php` models
- [ ] Add Swagger UI route to `routes/web.php`
- [ ] Generate documentation with `php artisan l5-swagger:generate`
- [ ] Test Swagger UI at `/api/documentation` and verify all endpoints are documented
