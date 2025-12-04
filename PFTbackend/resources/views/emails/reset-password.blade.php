@extends('emails.layouts.main')

@section('title', 'Reset Your Password')

@section('content')
    <h1 class="h1">Reset Your Password</h1>
    
    <p class="text">
        Hello,
    </p>
    
    <p class="text">
        You are receiving this email because we received a password reset request for your account.
        Click the button below to reset your password.
    </p>
    
    <div class="button-container">
        <a href="{{ $url }}" class="button">Reset Password</a>
    </div>
    
    <p class="text">
        This password reset link will expire in 60 minutes.
    </p>
    
    <p class="text">
        If you did not request a password reset, no further action is required.
    </p>
    
    <p class="text">
        Regards,<br>
        The MoneyTracker Team
    </p>
@endsection

@section('action_url', $url)