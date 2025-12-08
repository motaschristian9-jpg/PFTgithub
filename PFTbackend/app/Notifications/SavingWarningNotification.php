<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
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
        // Only database for now
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'title' => 'Savings Milestone',
            'message' => 'You are 85% of the way to your **' . $this->saving->name . '** goal!',
            'saving_id' => $this->saving->id,
            'type' => 'saving_warning',
        ];
    }
}
