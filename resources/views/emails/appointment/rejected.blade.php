<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Appointment Not Approved</title>
    <style>
        body { margin: 0; padding: 0; background: #f4f6f8; font-family: 'Segoe UI', Arial, sans-serif; color: #333; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        .header { background: #7f1d1d; padding: 32px 40px; text-align: center; }
        .header h1 { margin: 0; color: #fff; font-size: 22px; font-weight: 700; }
        .header p { margin: 6px 0 0; color: #fca5a5; font-size: 13px; }
        .badge { display: inline-block; background: #fee2e2; color: #7f1d1d; border-radius: 20px; padding: 4px 16px; font-size: 12px; font-weight: 600; margin: 20px auto 0; }
        .body { padding: 36px 40px; }
        .greeting { font-size: 16px; margin-bottom: 12px; }
        .intro { color: #555; font-size: 14px; line-height: 1.7; margin-bottom: 24px; }
        .card { background: #fff5f5; border-left: 4px solid #dc2626; border-radius: 6px; padding: 20px 24px; margin-bottom: 24px; }
        .card-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #fee2e2; font-size: 14px; }
        .card-row:last-child { border-bottom: none; }
        .card-row .label { color: #6b7280; font-weight: 500; }
        .card-row .value { color: #111; font-weight: 600; text-align: right; max-width: 60%; }
        .reason-box { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; padding: 16px 20px; margin-bottom: 24px; }
        .reason-box h4 { margin: 0 0 8px; color: #9f1239; font-size: 14px; }
        .reason-box p { margin: 0; font-size: 14px; color: #374151; line-height: 1.6; }
        .reapply-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px 20px; margin-bottom: 24px; }
        .reapply-box h4 { margin: 0 0 8px; color: #1e40af; font-size: 14px; }
        .reapply-box p { margin: 0; font-size: 13px; color: #374151; line-height: 1.6; }
        .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 40px; text-align: center; font-size: 12px; color: #9ca3af; }
        .footer strong { color: #374151; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>Tanauan School of Fisheries</h1>
        <p>Appointment Management System</p>
        <span class="badge">❌ Request Not Approved</span>
    </div>

    <div class="body">
        <p class="greeting">Hello, <strong>{{ $appointment->student->name }}</strong>.</p>
        <p class="intro">
            We regret to inform you that your appointment request has been <strong>rejected</strong> by the Registrar's Office.
            Please review the reason below and feel free to submit a new request after addressing the issue.
        </p>

        {{-- Appointment details --}}
        <div class="card">
            <div class="card-row">
                <span class="label">Reference #</span>
                <span class="value">#{{ str_pad($appointment->id, 6, '0', STR_PAD_LEFT) }}</span>
            </div>
            <div class="card-row">
                <span class="label">Requested Date</span>
                <span class="value">{{ $appointment->getFormattedDate() }}</span>
            </div>
            <div class="card-row">
                <span class="label">Requested Time</span>
                <span class="value">{{ $appointment->getFormattedTime() }}</span>
            </div>
            <div class="card-row">
                <span class="label">Purpose</span>
                <span class="value">{{ $appointment->purpose }}</span>
            </div>
            <div class="card-row">
                <span class="label">Status</span>
                <span class="value" style="color:#dc2626;">Rejected</span>
            </div>
        </div>

        {{-- Rejection reason --}}
        <div class="reason-box">
            <h4>📝 Reason for Rejection</h4>
            <p>{{ $appointment->rejection_reason ?? 'No specific reason was provided. Please contact the Registrar\'s Office for more information.' }}</p>
        </div>

        {{-- How to re-apply --}}
        <div class="reapply-box">
            <h4>💡 What Can You Do Next?</h4>
            <p>
                You may submit a new appointment request through the system after addressing the reason above.
                If you have questions, please visit or contact the Registrar's Office directly.
            </p>
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
