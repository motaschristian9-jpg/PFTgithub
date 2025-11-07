# Personal Finance Tracker (MoneyTracker)

## Description

MoneyTracker is a personal finance management application developed as a school project. It helps users track their income, expenses, and budgets to better manage their financial health. Built with Laravel for the backend, this app provides a robust API for handling user authentication, financial data, and more.

## Features

- **User Authentication**: Secure login and registration using Laravel Sanctum
- **Expense Tracking**: Log and categorize daily expenses
- **Income Management**: Record various income sources
- **Budget Planning**: Set and monitor monthly budgets
- **Financial Reports**: View summaries and analytics of financial data
- **Google Authentication**: Optional Google OAuth integration for easy login

## Installation

### Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js and npm (for frontend assets)
- MySQL or another supported database

### Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd PFTMoneyTracker
   ```

2. **Install PHP dependencies:**
   ```bash
   cd PFTbackend
   composer install
   ```

3. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

4. **Environment Setup:**
   - Copy `.env.example` to `.env`
   - Configure your database and other environment variables in `.env`

5. **Generate Application Key:**
   ```bash
   php artisan key:generate
   ```

6. **Run Migrations:**
   ```bash
   php artisan migrate
   ```

7. **Build Assets:**
   ```bash
   npm run build
   ```

8. **Start the Development Server:**
   ```bash
   php artisan serve
   ```

## Usage

- Access the application at `http://localhost:8000`
- Use API endpoints defined in `routes/api.php` for frontend integration
- Run tests with `php artisan test`

## API Documentation

The API provides endpoints for:
- Authentication (`/api/login`, `/api/register`)
- User management
- Financial data operations

Refer to `routes/api.php` for detailed route definitions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Team

Developed as part of a school project.
