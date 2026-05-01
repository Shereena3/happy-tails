<?php

namespace App\Console\Commands;

use App\Models\Reminder;
use App\Models\Notification;
use Illuminate\Console\Command;

class CheckReminders extends Command
{
    protected $signature = 'reminders:check';
    protected $description = 'Check due reminders and create notifications';

    public function handle()
    {
        $reminders = Reminder::with('pet')
            ->where('is_done', false)
            ->where('remind_at', '<=', now())
            ->get();

        foreach ($reminders as $reminder) {
            Notification::firstOrCreate(
                [
                    'pet_owner_id' => $reminder->pet->pet_owner_id,
                    'reminder_id' => $reminder->id,
                ],
                [
                    'title' => 'Reminder Due',
                    'message' => $reminder->title . ' is due now.',
                    'type' => Notification::TYPE_REMINDER_DUE,
                    'is_read' => false,
                ]
            );
        }

        $this->info('Reminder notifications checked.');

        return 0;
    }
}