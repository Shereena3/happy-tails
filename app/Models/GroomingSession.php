<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroomingSession extends Model
{
    use HasFactory;

    protected $table = 'grooming_sessions';

    protected $fillable = [
        'pet_id',
        'date',
        'service_type',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date'       => 'date',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Serialize dates as "YYYY-MM-DD" so the frontend never sees raw ISO timestamps.
     */
    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d');
    }

    // ============================
    // Constants
    // ============================

    const SERVICE_TYPES = [
        'Bath',
        'Haircut',
        'Nail Trim',
        'Ear Cleaning',
        'Full Groom',
        'Other',
    ];

    // ============================
    // Relationships
    // ============================

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    // ============================
    // Scopes
    // ============================

    public function scopeForPet($query, int $petId)
    {
        return $query->where('pet_id', $petId);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('date', '>=', today())->orderBy('date');
    }

    public function scopePast($query)
    {
        return $query->where('date', '<', today())->orderByDesc('date');
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where('service_type', 'like', "%{$search}%")
            ->orWhere('notes', 'like', "%{$search}%");
    }

    // ============================
    // Helper Methods
    // ============================

    public function isPast(): bool     { return $this->date->isPast(); }
    public function isToday(): bool    { return $this->date->isToday(); }
    public function isUpcoming(): bool { return $this->date->isFuture(); }

    public function getFormattedDate(): string
    {
        return $this->date->format('F d, Y');
    }

    public static function getServiceTypes(): array
    {
        return self::SERVICE_TYPES;
    }
}