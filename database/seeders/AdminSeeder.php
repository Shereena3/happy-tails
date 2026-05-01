<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admins = [
            [
                'last_name'   => 'Administrator',
                'first_name'  => 'System',
                'middle_name' => null,
                'suffix'      => null,
                'email'       => 'admin@tsf.edu.ph',
                'password'    => 'Admin@TSF2025',
                'role'        => 'admin',
                'is_active'   => true,
                'student_id'  => null,
            ],
        ];

        foreach ($admins as $admin) {
            User::updateOrCreate(
                ['email' => $admin['email']],
                array_merge($admin, [
                    'password' => Hash::make($admin['password']),
                ])
            );
        }

        $this->command->info('Admin account seeded successfully.');
        $this->command->table(
            ['Last Name', 'First Name', 'Email', 'Password (change me!)', 'Role'],
            collect($admins)->map(fn($a) => [
                $a['last_name'],
                $a['first_name'],
                $a['email'],
                $a['password'],
                $a['role'],
            ])->toArray()
        );
    }
}