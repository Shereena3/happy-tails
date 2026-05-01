<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Pet extends Model
{
    use HasFactory;

    protected $fillable = [
        'pet_owner_id',
        'name',
        'species',
        'breed',
        'sex',
        'birthday',
        'photo_path',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'birthday'   => 'date',
            'is_active'  => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Serialize all date/datetime fields as clean strings in JSON responses.
     * Dates      → "YYYY-MM-DD"
     * Datetimes  → "YYYY-MM-DD HH:MM:SS"
     */
    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d');
    }

    // ============================
    // Constants
    // ============================

    const SPECIES_DOG = 'dog';
    const SPECIES_CAT = 'cat';

    const SEX_MALE   = 'male';
    const SEX_FEMALE = 'female';

    // ============================
    // Computed Attributes
    // ============================

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path
            ? asset('storage/' . $this->photo_path)
            : null;
    }

    /**
     * Age in whole years (null if no birthday set).
     * Uses diffInYears to guarantee an integer — Carbon's ->age property
     * can return a float on some versions/locales.
     */
    public function getAgeAttribute(): ?int
    {
        return $this->birthday
            ? (int) $this->birthday->diffInYears(now())
            : null;
    }

    // ============================
    // Relationships
    // ============================

    public function owner()
    {
        return $this->belongsTo(PetOwner::class, 'pet_owner_id');
    }

    public function vaccinations()
    {
        return $this->hasMany(Vaccination::class);
    }

    public function medicines()
    {
        return $this->hasMany(Medicine::class);
    }

    public function groomingSessions()
    {
        return $this->hasMany(GroomingSession::class);
    }

    public function reminders()
    {
        return $this->hasMany(Reminder::class);
    }

    // ============================
    // Scopes
    // ============================

    public function scopeActive($query)   { return $query->where('is_active', true);  }
    public function scopeInactive($query) { return $query->where('is_active', false); }
    public function scopeDogs($query)     { return $query->where('species', self::SPECIES_DOG); }
    public function scopeCats($query)     { return $query->where('species', self::SPECIES_CAT); }

    public function scopeForOwner($query, int $ownerId)
    {
        return $query->where('pet_owner_id', $ownerId);
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name',  'like', "%{$search}%")
              ->orWhere('breed', 'like', "%{$search}%");
        });
    }

    // ============================
    // Helper Methods
    // ============================

    public function isActive(): bool    { return $this->is_active; }
    public function isDog(): bool       { return $this->species === self::SPECIES_DOG; }
    public function isCat(): bool       { return $this->species === self::SPECIES_CAT; }
    public function isMale(): bool      { return $this->sex === self::SEX_MALE; }
    public function isFemale(): bool    { return $this->sex === self::SEX_FEMALE; }
    public function hasBirthday(): bool { return $this->birthday !== null; }

    public function archive(): bool { return $this->update(['is_active' => false]); }
    public function restore(): bool { return $this->update(['is_active' => true]);  }

    public function getSpeciesLabel(): string { return ucfirst($this->species); }
    public function getSexLabel(): string     { return ucfirst($this->sex ?? 'Unknown'); }

    /**
     * Upcoming reminders for this pet (not yet done, sorted by remind_at).
     */
    public function getUpcomingReminders()
    {
        return $this->reminders()
            ->where('is_done', false)
            ->where('remind_at', '>=', now())
            ->orderBy('remind_at')
            ->get();
    }
public function getAgeStringAttribute(): string
{
    if (!$this->birthday) {
        return 'Unknown';
    }

    $birth = Carbon::parse($this->birthday);
    $now   = Carbon::now();

    $years = (int) $birth->diffInYears($now);
$months = (int) $birth->copy()->addYears($years)->diffInMonths($now);

    if ($years === 0) {
        return $months . ' month' . ($months != 1 ? 's' : '');
    }

    return $years . ' year' . ($years != 1 ? 's' : '') .
        ($months > 0 ? ' ' . $months . ' month' . ($months != 1 ? 's' : '') : '');
}   
    /**
     * Aggregated health summary for the pet profile screen.
     */
    public function getHealthSummary(): array
    {
        return [
            'vaccinations'      => $this->vaccinations()->count(),
            'medicines'         => $this->medicines()->count(),
            'grooming_sessions' => $this->groomingSessions()->count(),
            'pending_reminders' => $this->reminders()->where('is_done', false)->count(),
            'last_vaccination'  => $this->vaccinations()->latest('date_administered')->first()?->date_administered?->format('F d, Y'),
            'last_grooming'     => $this->groomingSessions()->latest('date')->first()?->date?->format('F d, Y'),
        ];
    }

    // ============================
    // Static Methods
    // ============================

    public static function getSpecies(): array
    {
        return [self::SPECIES_DOG, self::SPECIES_CAT];
    }

    public static function getSexOptions(): array
    {
        return [self::SEX_MALE, self::SEX_FEMALE];
    }
}