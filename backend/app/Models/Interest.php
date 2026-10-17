<?php

namespace App\Models;

use App\Models\Concerns\HasPublicId;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Interest extends Model
{
    use HasFactory, HasPublicId;

    protected $fillable = [
        'property_id',
        'interested_id',
        'status',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function interested(): BelongsTo
    {
        return $this->belongsTo(User::class, 'interested_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function transaction(): HasOne
    {
        return $this->hasOne(Transaction::class);
    }
}