# TODO: Add Unit and Feature Tests for PFTMoneyTracker Backend

## Unit Tests
- [ ] Create unit test for User model (relationships, fillable, hidden attributes)
- [ ] Create unit test for Transaction model (casts, scopes, relationships)
- [ ] Create unit test for Budget model
- [ ] Create unit test for Saving model
- [ ] Create unit test for ApiResponseTrait

## Feature Tests
- [ ] Create feature test for AuthController (register, login, logout)
- [ ] Create feature test for TransactionController (CRUD operations, filtering, caching)
- [ ] Create feature test for BudgetController
- [ ] Create feature test for SavingController
- [ ] Test validation requests (RegisterRequest, LoginRequest, etc.)
- [ ] Test API resources and collections
- [ ] Test observers (BudgetObserver, SavingObserver, TransactionObserver)
- [ ] Test UserScope

## Additional Tests
- [ ] Test middleware (CustomCors, ForceHttps)
- [ ] Test exception handling (ApiException)
- [ ] Test forgot password functionality
- [ ] Test Google authentication

## Run Tests
- [ ] Execute all tests and ensure they pass
- [ ] Update phpunit.xml if needed for coverage

## Add Cron Jobs for Auto Summary Generation

- [x] Create Summary model (app/Models/Summary.php)
- [x] Create migration for summaries table
- [x] Create GenerateMonthlySummaries command (app/Console/Commands/GenerateMonthlySummaries.php)
- [x] Register command in routes/console.php
- [x] Schedule command monthly in AppServiceProvider.php
- [x] Run php artisan migrate
- [x] Test command manually: php artisan summaries:generate
- [x] Verify scheduling works (check logs or DB)
