<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

use Illuminate\Contracts\Queue\ShouldQueue;

class ResetPasswordNotificationCustom extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $resetUrl;

    public function __construct(string $resetUrl)
    {
        $this->resetUrl = $resetUrl;
    }

    public function via($notifiable)
    {
        if (isset($notifiable->email_notifications_enabled) && !$notifiable->email_notifications_enabled) {
            return [];
        }
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $resetUrl = 'http://localhost:5173/reset-password?token=' . $this->resetUrl . '&email=' . urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('Reset Your Password')
            ->view('emails.reset-password', ['url' => $resetUrl]);
    }
}
