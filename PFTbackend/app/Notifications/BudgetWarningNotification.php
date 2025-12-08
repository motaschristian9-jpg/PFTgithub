<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Models\Budget;

class BudgetWarningNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $budget;

    public function __construct(Budget $budget)
    {
        $this->budget = $budget;
    }

    public function via($notifiable)
    {
        // Only database for now to avoid missing email template errors
        return ['database']; 
    }

    public function toArray($notifiable)
    {
        return [
            'title' => 'Budget Alert: Near Limit',
            'message' => 'You have used over 85% of your **' . $this->budget->name . '** budget.',
            'budget_id' => $this->budget->id,
            'type' => 'budget_warning',
        ];
    }
}
