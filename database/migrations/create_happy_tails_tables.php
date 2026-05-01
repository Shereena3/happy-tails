<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // ── 1. PET OWNERS ─────────────────────────────────────────────────────
        Schema::create('pet_owners', function (Blueprint $table) {
            $table->id();
            $table->string('last_name',   100);
            $table->string('first_name',  100);
            $table->string('middle_name', 100)->nullable();
            $table->string('suffix',       20)->nullable();

            $table->string('profile_photo_path')->nullable();
            $table->string('email')->unique();
            $table->string('phone_number', 30)->nullable();
            $table->string('address')->nullable();
            $table->string('password');

            $table->boolean('is_active')->default(true);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        // ── 2. PET CLINICS (user account) ─────────────────────────────────────
        Schema::create('pet_clinics', function (Blueprint $table) {
            $table->id();
            $table->string('clinic_name', 255);
            $table->string('profile_photo_path')->nullable();
            $table->string('email')->unique();
            $table->string('phone_number', 30)->nullable();
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('password');

            $table->boolean('is_active')->default(true);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        // ── 3. PETS ───────────────────────────────────────────────────────────
        Schema::create('pets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_owner_id')->constrained('pet_owners')->cascadeOnDelete();

            $table->string('name', 100);
            $table->enum('species', ['dog', 'cat']);
            $table->string('breed', 100)->nullable();
            $table->enum('sex', ['male', 'female'])->nullable();
            $table->date('birthday')->nullable();
            $table->string('photo_path')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── 4. VACCINATIONS ───────────────────────────────────────────────────
        Schema::create('vaccinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->constrained('pets')->cascadeOnDelete();

            $table->string('vaccine_name', 255);
            $table->date('date_administered')->nullable();
            $table->date('next_due_date')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
        });

        // ── 5. MEDICINES ──────────────────────────────────────────────────────
        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->constrained('pets')->cascadeOnDelete();

            $table->string('medicine_name', 255);
            $table->string('dosage', 100)->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
        });

        // ── 6. GROOMING SESSIONS ──────────────────────────────────────────────
        Schema::create('grooming_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->constrained('pets')->cascadeOnDelete();

            $table->date('date');
            $table->string('service_type', 100)->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
        });

        // ── 7. REMINDERS ──────────────────────────────────────────────────────
        Schema::create('reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->constrained('pets')->cascadeOnDelete();

            $table->enum('type', ['vaccination', 'medicine', 'grooming', 'vet_visit', 'other'])
                  ->default('other');
            $table->string('title', 255);
            $table->text('notes')->nullable();
            $table->dateTime('remind_at');
            $table->boolean('is_done')->default(false);

            $table->timestamps();
        });

        // ── 8. NOTIFICATIONS ──────────────────────────────────────────────────
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_owner_id')->constrained('pet_owners')->cascadeOnDelete();
            $table->foreignId('reminder_id')->nullable()->constrained('reminders')->nullOnDelete();

            $table->string('title', 255);
            $table->text('message');
            $table->enum('type', [
                'reminder_due',
                'vaccination_due',
                'medicine_due',
                'grooming_due',
                'vet_visit_due',
                'general',
            ])->default('general');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();

            $table->timestamps();
        });

        // ── 9. CACHE ──────────────────────────────────────────────────────────
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });

        // ── 10. SESSIONS ─────────────────────────────────────────────────────
        // user_type distinguishes which guard/table the session belongs to
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('user_type', 20)->nullable(); // 'pet_owner' | 'pet_clinic'
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('reminders');
        Schema::dropIfExists('grooming_sessions');
        Schema::dropIfExists('medicines');
        Schema::dropIfExists('vaccinations');
        Schema::dropIfExists('pets');
        Schema::dropIfExists('pet_clinics');
        Schema::dropIfExists('pet_owners');
    }
};