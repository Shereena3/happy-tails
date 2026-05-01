<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    use HasFactory;

    protected $fillable = [
        'pet_id',
        'medicine_name',
        'dosage',
        'start_date',
        'end_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
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
     * Medicines that are currently active (within start and end date).
     */
    public function scopeOngoing($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('end_date')
              ->orWhere('end_date', '>=', today());
        })->where(function ($q) {
            $q->whereNull('start_date')
              ->orWhere('start_date', '<=', today());
        });
    }

    /**
     * Medicines whose course has ended.
     */
    public function scopeCompleted($query)
    {
        return $query->whereNotNull('end_date')
            ->where('end_date', '<', today());
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where('medicine_name', 'like', "%{$search}%")
            ->orWhere('dosage', 'like', "%{$search}%");
    }

    // ============================
    // Helper Methods
    // ============================

    public function isOngoing(): bool
    {
        $afterStart = !$this->start_date || $this->start_date->lte(today());
        $beforeEnd  = !$this->end_date   || $this->end_date->gte(today());
        return $afterStart && $beforeEnd;
    }

    public function isCompleted(): bool
    {
        return $this->end_date && $this->end_date->isPast();
    }

    public function getFormattedStartDate(): ?string
    {
        return $this->start_date?->format('F d, Y');
    }

    public function getFormattedEndDate(): ?string
    {
        return $this->end_date?->format('F d, Y');
    }

    public function getStatusLabel(): string
    {
        if ($this->isCompleted()) return 'Completed';
        if ($this->isOngoing())   return 'Ongoing';
        return 'Upcoming';
    }
}