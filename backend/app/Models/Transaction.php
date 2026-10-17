<?php

namespace App\Models;

use App\Models\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory, HasPublicId;

    protected $fillable = [
        'interest_id',
        'amount',
        'commission_amount',
        'owner_amount',
        'payment_reference',
        'payment_status',
        'paid_at',
        'transferred_at',
        'transfer_reference',
        'appypay_charge_id'
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'commission_amount' => 'integer',
            'owner_amount' => 'integer',
            'paid_at' => 'datetime',
            'transferred_at' => 'datetime',
        ];
    }

    public function interest(): BelongsTo
    {
        return $this->belongsTo(Interest::class);
    }
}