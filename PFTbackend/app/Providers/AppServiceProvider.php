<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Console\Scheduling\Schedule;
use App\Models\Budget;
use App\Observers\BudgetObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Budget::observe(BudgetObserver::class);

        // Schedule the monthly summary generation
        if ($this->app->runningInConsole()) {
            $this->app->booted(function () {
                $schedule = $this->app->make(Schedule::class);
                $schedule->command('summaries:generate')
                         ->monthlyOn(1, '00:00'); // Run on the 1st of every month at midnight
            });
        }
    }
}
