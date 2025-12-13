<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\Saving;

class SavingWarningNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $saving;

    public function __construct(Saving $saving)
    {
        $this->saving = $saving;
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
            ->subject('Savings Milestone: ' . $this->saving->name)
            ->line('You are 85% of the way to your **' . $this->saving->name . '** goal!')
            ->action('View Goal', url('/savings'))
            ->line('Keep up the good work!');
    }

    public function toArray($notifiable)
    {
        return [
            'title' => 'Savings Milestone',
            'message' => 'You are 85% of the way to your **' . $this->saving->name . '** goal!',
            'saving_id' => $this->saving->id,
            'saving_name' => $this->saving->name,
            'type' => 'saving_warning',
        ];
    }
}
