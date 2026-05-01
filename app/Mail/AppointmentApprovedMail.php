<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class AppointmentApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Appointment $appointment) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Appointment Approved – Your QR Code is Ready',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment.approved',
        );
    }

    
     
    public function attachments(): array
    {
        $qrCode = $this->appointment->qrCode;

        if (!$qrCode || !$qrCode->qr_image_path) {
            return [];
        }

        $fullPath = Storage::disk('public')->path($qrCode->qr_image_path);

        if (!file_exists($fullPath)) {
            return [];
        }

        // Map extension → MIME type
        $extension = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
        $mime      = match ($extension) {
            'svg'  => 'image/svg+xml',
            'png'  => 'image/png',
            'jpg',
            'jpeg' => 'image/jpeg',
            default => 'application/octet-stream',
        };

        return [
            Attachment::fromPath($fullPath)
                ->as('appointment-qr-code.' . $extension)
                ->withMime($mime),
        ];
    }
}