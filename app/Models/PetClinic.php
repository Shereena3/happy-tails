<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class PetClinic extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'pet_clinics';

    protected $fillable = [
        'clinic_name',
        'profile_photo_path',
        'email',
        'phone_number',
        'address',
        'latitude',
        'longitude',
        'password',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
            'latitude'          => 'decimal:7',
            'longitude'         => 'decimal:7',
            'created_at'        => 'datetime',
            'updated_at'        => 'datetime',
        ];
    }

    // ============================
    // Computed Attributes
    // ============================

    public function getProfilePhotoUrlAttribute(): ?string
    {
        return $this->profile_photo_path
            ? asset('storage/' . $this->profile_photo_path)
            : null;
    }

    /**
     * Whether this clinic has geo-coordinates set.
     */
    public function hasLocation(): bool
    {
        return $this->latitude !== null && $this->longitude !== null;
    }

    // ============================
    // Scopes
    // ============================

    public function scopeActive($query)   { return $query->where('is_active', true);  }
    public function scopeInactive($query) { return $query->where('is_active', false); }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('clinic_name',  'like', "%{$search}%")
              ->orWhere('email',       'like', "%{$search}%")
              ->orWhere('address',     'like', "%{$search}%")
              ->orWhere('phone_number','like', "%{$search}%");
        });
    }

    /**
     * Filter clinics within a given radius (in km) from a lat/lng point.
     * Uses the Haversine formula approximation via raw SQL.
     */
    public function scopeNearby($query, float $lat, float $lng, float $radiusKm = 10)
    {
        return $query->selectRaw("*, 
            (6371 * acos(
                cos(radians(?)) * cos(radians(latitude)) *
                cos(radians(longitude) - radians(?)) +
                sin(radians(?)) * sin(radians(latitude))
            )) AS distance", [$lat, $lng, $lat])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->having('distance', '<=', $radiusKm)
            ->orderBy('distance');
    }

    // ============================
    // Helper Methods
    // ============================

    public function isActive(): bool  { return $this->is_active; }
    public function activate(): bool   { return $this->update(['is_active' => true]);  }
    public function deactivate(): bool { return $this->update(['is_active' => false]); }
}
