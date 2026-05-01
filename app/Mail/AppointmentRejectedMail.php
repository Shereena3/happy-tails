<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Appointment $appointment) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Appointment Request Was Not Approved',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment.rejected',
        );
    }

    // No QR code attachment for rejected appointments
    public function attachments(): array
    {
        return [];
    }
}
