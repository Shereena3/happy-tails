<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'pet_id',
        'type',
        'title',
        'notes',
        'remind_at',
        'is_done',
    ];

    protected function casts(): array
    {
        return [
            'remind_at'  => 'datetime',
            'is_done'    => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Serialize datetimes as "YYYY-MM-DD HH:MM:SS" (no trailing Z / microseconds)
     * so the frontend can parse them consistently without timezone surprises.
     */
    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d H:i:s');
    }

    // ============================
    // Constants
    // ============================

    const TYPE_VACCINATION = 'vaccination';
    const TYPE_MEDICINE    = 'medicine';
    const TYPE_GROOMING    = 'grooming';
    const TYPE_VET_VISIT   = 'vet_visit';
    const TYPE_OTHER       = 'other';

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

    public function scopePending($query)
    {
        return $query->where('is_done', false);
    }

    public function scopeDone($query)
    {
        return $query->where('is_done', true);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('is_done', false)
            ->where('remind_at', '>=', now())
            ->orderBy('remind_at');
    }

    public function scopeOverdue($query)
    {
        return $query->where('is_done', false)
            ->where('remind_at', '<', now())
            ->orderByDesc('remind_at');
    }

    public function scopeDueSoon($query, int $days = 7)
    {
        return $query->where('is_done', false)
            ->whereBetween('remind_at', [now(), now()->addDays($days)])
            ->orderBy('remind_at');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Reminders belonging to any of the given pet IDs.
     */
    public function scopeForOwner($query, array $petIds)
    {
        return $query->whereIn('pet_id', $petIds);
    }

    // ============================
    // Helper Methods
    // ============================

    public function isDone(): bool    { return $this->is_done; }
    public function isPending(): bool { return !$this->is_done; }
    public function isOverdue(): bool { return !$this->is_done && $this->remind_at->isPast(); }

    public function markAsDone(): bool
    {
        return $this->update(['is_done' => true]);
    }

    public function getFormattedRemindAt(): string
    {
        return $this->remind_at->format('F d, Y h:i A');
    }

    public function getTypeLabel(): string
    {
        return match ($this->type) {
            self::TYPE_VACCINATION => 'Vaccination',
            self::TYPE_MEDICINE    => 'Medicine',
            self::TYPE_GROOMING    => 'Grooming',
            self::TYPE_VET_VISIT   => 'Vet Visit',
            self::TYPE_OTHER       => 'Other',
            default                => ucfirst($this->type),
        };
    }

    public function getTypeColor(): string
    {
        return match ($this->type) {
            self::TYPE_VACCINATION => 'blue',
            self::TYPE_MEDICINE    => 'green',
            self::TYPE_GROOMING    => 'pink',
            self::TYPE_VET_VISIT   => 'purple',
            self::TYPE_OTHER       => 'gray',
            default                => 'gray',
        };
    }

    // ============================
    // Static Methods
    // ============================

    public static function getTypes(): array
    {
        return [
            self::TYPE_VACCINATION,
            self::TYPE_MEDICINE,
            self::TYPE_GROOMING,
            self::TYPE_VET_VISIT,
            self::TYPE_OTHER,
        ];
    }
}