<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
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
        $channels = ['database'];
        if (!isset($notifiable->email_notifications_enabled) || $notifiable->email_notifications_enabled) {
            $channels[] = 'mail';
        }
        return $channels;
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Budget Alert: ' . $this->budget->name)
            ->line('You have used over 85% of your **' . $this->budget->name . '** budget.')
            ->action('View Budget', url('/budgets'))
            ->line('Current usage is getting high. Please review your spending.');
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
