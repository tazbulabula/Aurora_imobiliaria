<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Message $message
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $isInterested = $notifiable->id === $this->message->interest->interested_id;
        $isAdmin = $notifiable->role === 'admin';

        $url = match (true) {
            $isAdmin => "/admin/interests/{$this->message->interest->public_id}",
            $isInterested => "/my/interests/{$this->message->interest->public_id}",
            default => "/admin/interests/{$this->message->interest->public_id}",
        };

        return [
            'title' => 'Nova mensagem',
            'message' => "{$this->message->sender->name}: " .
                mb_substr($this->message->content, 0, 80) .
                (mb_strlen($this->message->content) > 80 ? '...' : ''),
            'type' => 'new_message',
            'interest_public_id' => $this->message->interest->public_id,
            'url' => $url,
        ];
    }
}