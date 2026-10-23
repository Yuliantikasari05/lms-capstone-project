<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MentorSchedule extends Model
{
    use HasFactory;

    protected $table = 'mentor_schedules';

    protected $fillable = [
        'mentor_id',
        'mentor_name',
        'title',
        'course_name',
        'session_type',
        'scheduled_date',
        'start_time',
        'duration_minutes',
        'meeting_url',
        'notes',
        'attendees_count',
        'is_finished',
    ];

    protected $casts = [
        'scheduled_date' => 'date:Y-m-d',
        'duration_minutes' => 'integer',
        'attendees_count' => 'integer',
        'is_finished' => 'boolean',
    ];

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }
}
