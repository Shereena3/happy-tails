<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use Illuminate\Database\Seeder;

/**
 * Seeds the initial document types for the TSF Appointment System.
 *
 * is_one_time = true  → student can only claim this document once.
 *                        Once completed, it will be greyed out / blocked in the request form.
 * is_one_time = false → student can request this document multiple times (e.g., Enrollment Certificate).
 *
 * Run with: php artisan db:seed --class=DocumentTypeSeeder
 */
class DocumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $documents = [
            // ── One-time documents (can only be claimed once per student) ──
            [
                'name'        => 'Certificate of Good Moral Character',
                'code'        => 'CGMC',
                'description' => 'Official certificate attesting to the student\'s good moral standing.',
                'is_one_time' => true,
                'is_active'   => true,
            ],
            [
                'name'        => 'Form 137 (Permanent Record)',
                'code'        => 'F137',
                'description' => 'Permanent school record containing grades and academic history.',
                'is_one_time' => true,
                'is_active'   => true,
            ],
            [
                'name'        => 'Diploma',
                'code'        => 'DIPL',
                'description' => 'Official diploma issued upon graduation.',
                'is_one_time' => true,
                'is_active'   => true,
            ],
            [
                'name'        => 'Transcript of Records (TOR)',
                'code'        => 'TOR',
                'description' => 'Official transcript of the student\'s academic records.',
                'is_one_time' => true,
                'is_active'   => true,
            ],

            // ── Repeatable documents (can be requested multiple times) ──
            [
                'name'        => 'Certificate of Enrollment',
                'code'        => 'COE',
                'description' => 'Confirms that the student is currently enrolled.',
                'is_one_time' => false,
                'is_active'   => true,
            ],
            [
                'name'        => 'Form 138 (Report Card)',
                'code'        => 'F138',
                'description' => 'Grade report card for the current or past school year.',
                'is_one_time' => false,
                'is_active'   => true,
            ],
            [
                'name'        => 'School ID',
                'code'        => 'SID',
                'description' => 'Official school identification card.',
                'is_one_time' => false,
                'is_active'   => true,
            ],
            [
                'name'        => 'Certification Letter',
                'code'        => 'CERT',
                'description' => 'General certification letter as requested.',
                'is_one_time' => false,
                'is_active'   => true,
            ],
        ];

        foreach ($documents as $doc) {
            DocumentType::updateOrCreate(
                ['code' => $doc['code']],
                $doc
            );
        }

        $this->command->info('Document types seeded successfully.');
        $this->command->table(
            ['Name', 'Code', 'One-Time', 'Active'],
            collect($documents)->map(fn($d) => [
                $d['name'],
                $d['code'],
                $d['is_one_time'] ? 'Yes' : 'No',
                $d['is_active']   ? 'Yes' : 'No',
            ])->toArray()
        );
    }
}