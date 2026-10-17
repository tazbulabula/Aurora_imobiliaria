<?php

namespace App\Notifications;

use App\Models\Interest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InterestStatusChangedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Interest $interest,
        public string $newStatus
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $labels = [
            'em_mediacao' => 'em mediação',
            'visita_agendada' => 'com visita agendada',
            'negociacao' => 'em negociação',
            'fechado' => 'concluído',
            'cancelado' => 'cancelado',
        ];
        $label = $labels[$this->newStatus] ?? $this->newStatus;

        $isInterested = $notifiable->id === $this->interest->interested_id;

        return [
            'title' => 'Estado do processo atualizado',
            'message' => "O processo para \"{$this->interest->property->title}\" está {$label}.",
            'type' => 'interest_status_changed',
            'interest_public_id' => $this->interest->public_id,
            'url' => $isInterested
                ? "/my/interests/{$this->interest->public_id}"
                : "/admin/interests/{$this->interest->public_id}",
        ];
    }
}