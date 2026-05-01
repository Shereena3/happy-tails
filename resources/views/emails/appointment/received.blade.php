<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Appointment Request Received</title>
    <style>
        body { margin: 0; padding: 0; background: #f4f6f8; font-family: 'Segoe UI', Arial, sans-serif; color: #333; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        .header { background: #1e40af; padding: 32px 40px; text-align: center; }
        .header img { height: 48px; margin-bottom: 12px; }
        .header h1 { margin: 0; color: #fff; font-size: 22px; font-weight: 700; letter-spacing: 0.3px; }
        .header p { margin: 6px 0 0; color: #bfdbfe; font-size: 13px; }
        .badge { display: inline-block; background: #fef9c3; color: #92400e; border-radius: 20px; padding: 4px 16px; font-size: 12px; font-weight: 600; margin: 20px auto 0; }
        .body { padding: 36px 40px; }
        .greeting { font-size: 16px; margin-bottom: 12px; }
        .intro { color: #555; font-size: 14px; line-height: 1.7; margin-bottom: 24px; }
        .card { background: #f0f4ff; border-left: 4px solid #1e40af; border-radius: 6px; padding: 20px 24px; margin-bottom: 24px; }
        .card-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #dde4f5; font-size: 14px; }
        .card-row:last-child { border-bottom: none; }
        .card-row .label { color: #6b7280; font-weight: 500; }
        .card-row .value { color: #111; font-weight: 600; text-align: right; max-width: 60%; }
        .doc-list { margin: 16px 0 0; }
        .doc-list h4 { font-size: 13px; color: #6b7280; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .doc-item { background: #fff; border: 1px solid #e5e7eb; border-radius: 5px; padding: 8px 14px; margin-bottom: 6px; font-size: 13px; display: flex; justify-content: space-between; }
        .doc-item .qty { color: #1e40af; font-weight: 700; }
        .note { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 14px 18px; font-size: 13px; color: #78350f; margin-bottom: 24px; }
        .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 40px; text-align: center; font-size: 12px; color: #9ca3af; }
        .footer strong { color: #374151; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>Tanauan School of Fisheries</h1>
        <p>Appointment Management System</p>
        <span class="badge">⏳ Pending Review</span>
    </div>

    <div class="body">
        <p class="greeting">Hello, <strong>{{ $appointment->student->name }}</strong>!</p>
        <p class="intro">
            We have successfully received your appointment request. Our staff will review it shortly.
            You will receive another email once a decision has been made.
        </p>

        <div class="card">
            <div class="card-row">
                <span class="label">Reference #</span>
                <span class="value">#{{ str_pad($appointment->id, 6, '0', STR_PAD_LEFT) }}</span>
            </div>
            <div class="card-row">
                <span class="label">Date</span>
                <span class="value">{{ $appointment->getFormattedDate() }}</span>
            </div>
            <div class="card-row">
                <span class="label">Time</span>
                <span class="value">{{ $appointment->getFormattedTime() }}</span>
            </div>
            <div class="card-row">
                <span class="label">Purpose</span>
                <span class="value">{{ $appointment->purpose }}</span>
            </div>
            @if($appointment->is_representative)
            <div class="card-row">
                <span class="label">Representative</span>
                <span class="value">{{ $appointment->representative_name }} ({{ $appointment->representative_relationship }})</span>
            </div>
            @endif

            <div class="doc-list">
                <h4>Requested Documents</h4>
                @foreach($appointment->appointmentDocuments as $doc)
                <div class="doc-item">
                    <span>{{ $doc->documentType->name }}</span>
                    <span class="qty">× {{ $doc->quantity }}</span>
                </div>
                @endforeach
            </div>
        </div>

        <div class="note">
            📌 <strong>What happens next?</strong><br>
            Our admin team will review your request within 1–2 business days.
            If approved, you will receive a QR code to present on the day of your appointment.
        </div>
    </div>

    <div class="footer">
        <strong>Tanauan School of Fisheries</strong><br>
        This is an automated message. Please do not reply to this email.<br>
        © {{ date('Y') }} All rights reserved.
    </div>
</div>
</body>
</html>
