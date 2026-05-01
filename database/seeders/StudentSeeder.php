<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $students = [
            [
                'last_name'    => 'Velorde',
                'first_name'   => 'Samuel',
                'middle_name'  => null,
                'suffix'       => null,
                'student_id'   => 'STEM1201',
                'email'        => 'samuel.velorde@student.tsf.edu.ph',
                'phone_number' => '09171234567',
                'password'     => 'Student@2025',
                'track'        => 'academic',
                'strand'       => 'abm',
            ],
            [
                'last_name'    => 'Dela Cruz',
                'first_name'   => 'Maria',
                'middle_name'  => null,
                'suffix'       => null,
                'student_id'   => 'STEM1202',
                'email'        => 'maria.delacruz@student.tsf.edu.ph',
                'phone_number' => '09281234568',
                'password'     => 'Student@2025',
                'track'        => 'academic',
                'strand'       => 'humss',
            ],
            [
                'last_name'    => 'Reyes',
                'first_name'   => 'Juan Carlo',
                'middle_name'  => null,
                'suffix'       => 'Jr.',
                'student_id'   => 'STEM1203',
                'email'        => 'juancarlo.reyes@student.tsf.edu.ph',
                'phone_number' => '09391234569',
                'password'     => 'Student@2025',
                'track'        => 'tvl',
                'strand'       => 'he',
            ],
            [
                'last_name'    => 'Santos',
                'first_name'   => 'Ana Liza',
                'middle_name'  => 'Cruz',
                'suffix'       => null,
                'student_id'   => 'SF9001',
                'email'        => 'analiza.santos@student.tsf.edu.ph',
                'phone_number' => '09501234570',
                'password'     => 'Student@2025',
                'track'        => 'tvl',
                'strand'       => 'af',
            ],
            [
                'last_name'    => 'Garcia',
                'first_name'   => 'Roberto',
                'middle_name'  => null,
                'suffix'       => 'III',
                'student_id'   => 'SF9002',
                'email'        => 'roberto.garcia@student.tsf.edu.ph',
                'phone_number' => '09611234571',
                'password'     => 'Student@2025',
                'track'        => 'tvl',
                'strand'       => 'ict',
            ],
        ];

        foreach ($students as $student) {
            User::updateOrCreate(
                ['student_id' => $student['student_id']],
                array_merge($student, [
                    'password'  => Hash::make($student['password']),
                    'role'      => 'student',
                    'is_active' => true,
                ])
            );
        }

        $this->command->info('Student accounts seeded successfully.');
        $this->command->table(
            ['Name', 'Student ID', 'Track', 'Strand', 'Email'],
            collect($students)->map(fn($s) => [
                $s['last_name'] . ', ' . $s['first_name'] . ($s['suffix'] ? ' ' . $s['suffix'] : ''),
                $s['student_id'],
                ucfirst($s['track']),
                strtoupper($s['strand']),
                $s['email'],
            ])->toArray()
        );
    }
}