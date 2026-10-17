<?php

namespace App\Notifications;

use App\Models\Property;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PropertyStatusChangedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Property $property,
        public string $status,
        public ?string $reason = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $isApproved = $this->status === 'aprovado';

        return [
            'title' => $isApproved ? 'Imóvel aprovado' : 'Imóvel rejeitado',
            'message' => $isApproved
                ? "O teu imóvel \"{$this->property->title}\" foi aprovado e já está visível."
                : "O teu imóvel \"{$this->property->title}\" foi rejeitado. Motivo: {$this->reason}",
            'type' => "property_{$this->status}",
            'property_public_id' => $this->property->public_id,
            'url' => $isApproved ? "/properties/{$this->property->public_id}" : '/owner',
        ];
    }
}