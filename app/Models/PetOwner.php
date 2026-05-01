<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class PetOwner extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'pet_owners';

    protected $fillable = [
        'last_name',
        'first_name',
        'middle_name',
        'suffix',
        'profile_photo_path',
        'email',
        'phone_number',
        'address',
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
            'created_at'        => 'datetime',
            'updated_at'        => 'datetime',
        ];
    }

    // ============================
    // Constants
    // ============================

    const SUFFIXES = ['Jr.', 'Sr.', 'II', 'III', 'IV'];

    // ============================
    // Computed Attributes
    // ============================

    /**
     * Full formatted name: "Dela Cruz, Juan M. Jr."
     */
    public function getNameAttribute(): string
    {
        $mi  = $this->middle_name ? mb_substr($this->middle_name, 0, 1) . '.' : '';
        $sfx = $this->suffix ? ' ' . $this->suffix : '';
        $given = trim(implode(' ', array_filter([$this->first_name, $mi])));

        return trim($this->last_name . ', ' . $given . $sfx);
    }

    public function getProfilePhotoUrlAttribute(): ?string
    {
        return $this->profile_photo_path
            ? asset('storage/' . $this->profile_photo_path)
            : null;
    }

    // ============================
    // Relationships
    // ============================

    public function pets()
    {
        return $this->hasMany(Pet::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // ============================
    // Scopes
    // ============================

    public function scopeActive($query)   { return $query->where('is_active', true);  }
    public function scopeInactive($query) { return $query->where('is_active', false); }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('last_name',    'like', "%{$search}%")
              ->orWhere('first_name',  'like', "%{$search}%")
              ->orWhere('middle_name', 'like', "%{$search}%")
              ->orWhere('email',       'like', "%{$search}%")
              ->orWhere('phone_number','like', "%{$search}%");
        });
    }

public function getFullNameAttribute(): string
{
    $name = $this->last_name . ', ' . $this->first_name;
    
    if ($this->middle_name) {
        $name .= ' ' . substr($this->middle_name, 0, 1) . '.';
    }
    
    if ($this->suffix) {
        $name .= ' ' . $this->suffix;
    }
    
    return $name;
}


    // ============================
    // Helper Methods
    // ============================

    public function isActive(): bool  { return $this->is_active; }
    public function activate(): bool   { return $this->update(['is_active' => true]);  }
    public function deactivate(): bool { return $this->update(['is_active' => false]); }

    public function getUnreadNotifications()
    {
        return $this->notifications()
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getUnreadNotificationsCount(): int
    {
        return $this->notifications()->where('is_read', false)->count();
    }

    public function hasUnreadNotifications(): bool
    {
        return $this->notifications()->where('is_read', false)->exists();
    }

    public function getDashboardStats(): array
    {
        $petIds = $this->pets()->pluck('id');

        return [
            'total_pets'              => $this->pets()->count(),
            'active_pets'             => $this->pets()->where('is_active', true)->count(),
            'total_vaccinations'      => Vaccination::whereIn('pet_id', $petIds)->count(),
            'total_medicines'         => Medicine::whereIn('pet_id', $petIds)->count(),
            'total_grooming_sessions' => GroomingSession::whereIn('pet_id', $petIds)->count(),
            'pending_reminders'       => Reminder::whereIn('pet_id', $petIds)->where('is_done', false)->count(),
            'unread_notifications'    => $this->getUnreadNotificationsCount(),
        ];
    }
}
