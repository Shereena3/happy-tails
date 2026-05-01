<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Appointment Approved</title>
    <style>
        body { margin: 0; padding: 0; background: #f4f6f8; font-family: 'Segoe UI', Arial, sans-serif; color: #333; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        .header { background: #065f46; padding: 32px 40px; text-align: center; }
        .header h1 { margin: 0; color: #fff; font-size: 22px; font-weight: 700; }
        .header p { margin: 6px 0 0; color: #a7f3d0; font-size: 13px; }
        .badge { display: inline-block; background: #d1fae5; color: #064e3b; border-radius: 20px; padding: 4px 16px; font-size: 12px; font-weight: 600; margin: 20px auto 0; }
        .body { padding: 36px 40px; }
        .greeting { font-size: 16px; margin-bottom: 12px; }
        .intro { color: #555; font-size: 14px; line-height: 1.7; margin-bottom: 24px; }
        .card { background: #f0fdf4; border-left: 4px solid #059669; border-radius: 6px; padding: 20px 24px; margin-bottom: 24px; }
        .card-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #d1fae5; font-size: 14px; }
        .card-row:last-child { border-bottom: none; }
        .card-row .label { color: #6b7280; font-weight: 500; }
        .card-row .value { color: #111; font-weight: 600; text-align: right; max-width: 60%; }
        .doc-list { margin: 16px 0 0; }
        .doc-list h4 { font-size: 13px; color: #6b7280; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .doc-item { background: #fff; border: 1px solid #e5e7eb; border-radius: 5px; padding: 8px 14px; margin-bottom: 6px; font-size: 13px; display: flex; justify-content: space-between; }
        .doc-item .qty { color: #059669; font-weight: 700; }
        .qr-box { background: #fff; border: 2px dashed #059669; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px; }
        .qr-box h3 { margin: 0 0 6px; color: #065f46; font-size: 15px; }
        .qr-box p { margin: 0 0 16px; font-size: 13px; color: #6b7280; }
        .pin-display { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px 24px; display: inline-block; }
        .pin-display .pin-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px; }
        .pin-display .pin-value { font-size: 32px; font-weight: 800; color: #065f46; letter-spacing: 8px; }
        .instructions { background: #f0fdf4; border-radius: 6px; padding: 16px 20px; margin-bottom: 24px; }
        .instructions h4 { margin: 0 0 10px; color: #065f46; font-size: 14px; }
        .instructions ol { margin: 0; padding-left: 18px; font-size: 13px; color: #374151; line-height: 1.8; }
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
        <span class="badge">✅ Appointment Approved</span>
    </div>

    <div class="body">
        <p class="greeting">Congratulations, <strong>{{ $appointment->student->name }}</strong>!</p>
        <p class="intro">
            Your appointment request has been <strong>approved</strong>. Your QR code is attached to this email as an image file.
            Please save it and present it on the day of your appointment — either printed or on your phone screen.
        </p>

        {{-- Appointment details --}}
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

        {{-- QR + PIN section --}}
        @if($appointment->qrCode)
        <div class="qr-box">
            <h3>🔳 Your QR Code</h3>
            <p>The QR code image is attached to this email. Your security PIN is below.</p>
            <div class="pin-display">
                <span class="pin-label">Security PIN</span>
                <span class="pin-value">{{ $appointment->qrCode->pin }}</span>
            </div>
        </div>
        @endif

        {{-- Instructions --}}
        <div class="instructions">
            <h4>📋 On the Day of Your Appointment</h4>
            <ol>
                <li>Arrive at the Registrar's Office at your scheduled time.</li>
                <li>Open the QR code attachment from this email (or print it).</li>
                <li>Show the QR code to the staff for scanning.</li>
                <li>Provide your PIN if requested for verification.</li>
                @if($appointment->is_representative)
                <li>The representative must bring a valid ID and the original consent letter.</li>
                @endif
            </ol>
        </div>

        <div class="note">
            ⚠️ <strong>Important:</strong> The QR code is for single use only. Do not share it with others.
            If you cannot attend, please cancel your appointment through the system as soon as possible.
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
