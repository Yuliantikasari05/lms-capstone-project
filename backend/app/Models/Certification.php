<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'employee_name',
        'email',
        'company',
        'track',
        'training_hours',
        'portfolio_url',
        'status',
        'certificate_number',
        'issued_at',
        'admin_notes',
    ];

    protected $casts = [
        'training_hours' => 'integer',
        'issued_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
