<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vaccination extends Model
{
    use HasFactory;

    protected $fillable = [
        'pet_id',
        'vaccine_name',
        'date_administered',
        'next_due_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_administered' => 'date',
            'next_due_date'     => 'date',
            'created_at'        => 'datetime',
            'updated_at'        => 'datetime',
        ];
    }

    /**
     * Serialize dates as "YYYY-MM-DD" and datetimes as "YYYY-MM-DD HH:MM:SS"
     * so the frontend never receives a raw ISO-8601 timestamp.
     */
    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d');
    }

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

    /**
     * Vaccinations whose next due date is on or before today (overdue).
     */
    public function scopeOverdue($query)
    {
        return $query->whereNotNull('next_due_date')
            ->where('next_due_date', '<', today());
    }

    /**
     * Vaccinations due within the next N days.
     */
    public function scopeDueSoon($query, int $days = 30)
    {
        return $query->whereNotNull('next_due_date')
            ->whereBetween('next_due_date', [today(), today()->addDays($days)]);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where('vaccine_name', 'like', "%{$search}%");
    }

    public function getFormattedDateAdministeredAttribute(): ?string
    {
        return $this->getFormattedDateAdministered();
    }

    public function getFormattedNextDueDateAttribute(): ?string
    {
        return $this->getFormattedNextDueDate();
    }
    // ============================
    // Helper Methods
    // ============================

    public function isDue(): bool
    {
        return $this->next_due_date && $this->next_due_date->isPast();
    }

    public function isDueSoon(int $days = 30): bool
    {
        if (!$this->next_due_date) return false;
        return $this->next_due_date->isFuture()
            && $this->next_due_date->diffInDays(now()) <= $days;
    }

    public function getFormattedDateAdministered(): ?string
    {
        return $this->date_administered?->format('F d, Y');
    }

    public function getFormattedNextDueDate(): ?string
    {
        return $this->next_due_date?->format('F d, Y');
    }
}