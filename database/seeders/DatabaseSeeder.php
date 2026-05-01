<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Master database seeder for the TSF Appointment System.
 *
 * ORDER MATTERS — foreign key dependencies must be seeded first:
 *   1. DocumentTypes  (no dependencies)
 *   2. Admin users    (no dependencies)
 *   3. Students       (no dependencies, but logically after admin)
 *   4. (Appointments, QrCodes, Notifications are created through the app, not seeded)
 *
 * Run all seeders:  php artisan db:seed
 * Fresh + seed:     php artisan migrate:fresh --seed
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('══════════════════════════════════════════════════');
        $this->command->info('  TSF Appointment System — Database Seeder');
        $this->command->info('══════════════════════════════════════════════════');
        $this->command->info('');

        $this->call([
            DocumentTypeSeeder::class,  // 1. Document types first (appointments depend on them)
            AdminSeeder::class,         // 2. Admin account
            StudentSeeder::class,       // 3. Sample student accounts (dev/testing only)
        ]);

        $this->command->info('');
        $this->command->info('✅  All seeders completed successfully.');
        $this->command->info('');
        $this->command->warn('⚠️   IMPORTANT: Change the admin password after first login!');
        $this->command->warn('⚠️   Remove StudentSeeder from this file before deploying to production.');
        $this->command->info('');
    }
}
