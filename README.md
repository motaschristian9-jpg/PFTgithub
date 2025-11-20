# PFTMoneyTracker

A personal finance tracking application built with React (frontend) and Laravel (backend).

## Features

- User authentication and authorization
- Transaction management (income and expenses)
- Category-based organization
- Budget tracking
- Savings goals
- Dashboard with financial insights
- Responsive design

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Query (TanStack Query)
- Axios for API calls
- Lucide React for icons

### Backend
- Laravel 11
- Laravel Sanctum for authentication
- MySQL database
- Swagger/OpenAPI documentation

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PHP (v8.2 or higher)
- Composer
- MySQL

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/PFTMoneyTracker.git
cd PFTMoneyTracker
```

2. Backend Setup:
```bash
cd PFTbackend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

3. Frontend Setup:
```bash
cd PFTfrontend
npm install
npm run dev
```

4. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## API Documentation

API documentation is available via Swagger at `/api/documentation` when the backend is running.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
