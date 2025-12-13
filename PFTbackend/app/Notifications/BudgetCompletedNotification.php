<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Models\Budget;

class BudgetCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $budget;

    public function __construct(Budget $budget)
    {
        $this->budget = $budget;
    }

    public function via($notifiable)
    {
        $channels = ['database']; // Always save to database for in-app notifications

        if (!isset($notifiable->email_notifications_enabled) || $notifiable->email_notifications_enabled) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Budget Reached: ' . $this->budget->name)
            ->view('emails.budget-completed', [
                'budget' => $this->budget,
                'user' => $notifiable
            ]);
    }

    public function toArray($notifiable)
    {
        return [
            'title' => 'Budget Limit Reached',
            'message' => 'You have reached 100% of your allocated amount for ' . $this->budget->name,
            'budget_id' => $this->budget->id,
            'budget_name' => $this->budget->name,
            'type' => 'budget_reached',
        ];
    }
}
