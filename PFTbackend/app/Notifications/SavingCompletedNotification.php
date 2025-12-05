<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Models\Saving;

class SavingCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $saving;

    public function __construct(Saving $saving)
    {
        $this->saving = $saving;
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
            ->subject('Savings Goal Reached: ' . $this->saving->name)
            ->view('emails.saving-completed', [
                'saving' => $this->saving,
                'user' => $notifiable
            ]);
    }

    public function toArray($notifiable)
    {
        return [
            'title' => 'Goal Reached! 🎉',
            'message' => 'Congratulations! You have reached your savings goal for ' . $this->saving->name,
            'saving_id' => $this->saving->id,
            'type' => 'saving_completed',
        ];
    }
}
