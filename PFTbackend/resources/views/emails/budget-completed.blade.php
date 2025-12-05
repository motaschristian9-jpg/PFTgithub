@extends('emails.layouts.main')

@section('title', 'Budget Reached')

@section('content')
<h1 style="color:#111827;font-size:24px;font-weight:700;margin:0 0 24px 0;line-height:32px;">
    Budget Limit Reached ⚠️
</h1>

<p style="color:#374151;font-size:16px;line-height:24px;margin:0 0 24px 0;">
    Hello {{ $user->name }},
</p>

<p style="color:#374151;font-size:16px;line-height:24px;margin:0 0 24px 0;">
    You have reached 100% of your allocated amount for the budget <strong>{{ $budget->name }}</strong>.
</p>

<div style="background-color:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:24px;margin-bottom:32px;">
    <p style="margin:0 0 8px 0;font-size:14px;color:#991B1B;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Budget Details</p>
    <p style="margin:0;font-size:20px;color:#7F1D1D;font-weight:700;">{{ $budget->name }}</p>
    <p style="margin:8px 0 0 0;font-size:16px;color:#991B1B;">
        Limit: <strong>{{ number_format($budget->amount, 2) }}</strong>
    </p>
</div>

<p style="color:#374151;font-size:16px;line-height:24px;margin:0 0 32px 0;">
    You might want to review your expenses or adjust your budget limit.
</p>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width:100%;">
    <tr>
        <td align="center">
            <a href="{{ config('app.url') }}/budgets" style="display:inline-block;background-color:#DC2626;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:16px 32px;border-radius:12px;transition:background-color 0.2s;">
                View Budget
            </a>
        </td>
    </tr>
</table>
@endsection
