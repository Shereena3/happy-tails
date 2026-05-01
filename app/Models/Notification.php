<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'pet_owner_id',
        'reminder_id',
        'title',
        'message',
        'type',
        'is_read',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'is_read'    => 'boolean',
            'read_at'    => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // ============================
    // Constants
    // ============================

    const TYPE_REMINDER_DUE      = 'reminder_due';
    const TYPE_VACCINATION_DUE   = 'vaccination_due';
    const TYPE_MEDICINE_DUE      = 'medicine_due';
    const TYPE_GROOMING_DUE      = 'grooming_due';
    const TYPE_VET_VISIT_DUE     = 'vet_visit_due';
    const TYPE_GENERAL           = 'general';

    // ============================
    // Relationships
    // ============================

    public function owner()
    {
        return $this->belongsTo(PetOwner::class, 'pet_owner_id');
    }

    public function reminder()
    {
        return $this->belongsTo(Reminder::class);
    }

    // ============================
    // Scopes
    // ============================

    public function scopeUnread($query)   { return $query->where('is_read', false); }
    public function scopeRead($query)     { return $query->where('is_read', true);  }

    public function scopeByOwner($query, int $ownerId)
    {
        return $query->where('pet_owner_id', $ownerId);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days))
            ->orderByDesc('created_at');
    }

    // ============================
    // Helper Methods
    // ============================

    public function isRead(): bool { return $this->is_read; }

    public function markAsRead(): bool
    {
        return $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    public function getTypeLabel(): string
    {
        return match ($this->type) {
            self::TYPE_REMINDER_DUE    => 'Reminder Due',
            self::TYPE_VACCINATION_DUE => 'Vaccination Due',
            self::TYPE_MEDICINE_DUE    => 'Medicine Due',
            self::TYPE_GROOMING_DUE    => 'Grooming Due',
            self::TYPE_VET_VISIT_DUE   => 'Vet Visit Due',
            self::TYPE_GENERAL         => 'General',
            default                    => ucfirst($this->type),
        };
    }

    public function getTypeColor(): string
    {
        return match ($this->type) {
            self::TYPE_VACCINATION_DUE => 'blue',
            self::TYPE_MEDICINE_DUE    => 'green',
            self::TYPE_GROOMING_DUE    => 'pink',
            self::TYPE_VET_VISIT_DUE   => 'purple',
            self::TYPE_REMINDER_DUE    => 'amber',
            self::TYPE_GENERAL         => 'gray',
            default                    => 'gray',
        };
    }

    // ============================
    // Static Factory Methods
    // ============================

    public static function createForOwner(
        int $ownerId,
        string $title,
        string $message,
        string $type,
        ?int $reminderId = null
    ): self {
        return self::create([
            'pet_owner_id' => $ownerId,
            'reminder_id'  => $reminderId,
            'title'        => $title,
            'message'      => $message,
            'type'         => $type,
        ]);
    }

    public static function notifyReminderDue(Reminder $reminder): self
    {
        $petName = $reminder->pet->name;
        $label   = $reminder->getTypeLabel();

        return self::createForOwner(
            $reminder->pet->pet_owner_id,
            "{$label} Reminder for {$petName}",
            "Don't forget: {$reminder->title} for {$petName} is due on {$reminder->getFormattedRemindAt()}.",
            self::TYPE_REMINDER_DUE,
            $reminder->id
        );
    }

    public static function markAllAsReadFor(int $ownerId): int
    {
        return self::byOwner($ownerId)->unread()->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    // ============================
    // Attributes
    // ============================

    public function getTypeBadgeAttribute(): array
    {
        return [
            'label' => $this->getTypeLabel(),
            'color' => $this->getTypeColor(),
        ];
    }
}
