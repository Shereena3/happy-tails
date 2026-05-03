<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('pet_clinics') && !Schema::hasColumn('pet_clinics', 'clinic_hours')) {
            Schema::table('pet_clinics', function (Blueprint $table) {
                $table->string('clinic_hours')->nullable()->after('address');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('pet_clinics') && Schema::hasColumn('pet_clinics', 'clinic_hours')) {
            Schema::table('pet_clinics', function (Blueprint $table) {
                $table->dropColumn('clinic_hours');
            });
        }
    }
};