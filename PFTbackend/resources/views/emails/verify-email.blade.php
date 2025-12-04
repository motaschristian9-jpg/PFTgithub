@extends('emails.layouts.main')

@section('title', 'Verify Your Email Address')

@section('content')
    <h1 class="h1">Verify Your Identity</h1>
    
    <p class="text">
        Hello {{ $user->name }},
    </p>
    
    <p class="text">
        Thanks for signing up for MoneyTracker! We're excited to have you on board.
        To ensure the security of your account and access all features, please verify your email address by clicking the button below.
    </p>
    
    <div class="button-container">
        <a href="{{ $url }}" class="button">Verify Email Address</a>
    </div>
    
    <p class="text">
        If you did not create an account, no further action is required.
    </p>
    
    <p class="text">
        Regards,<br>
        The MoneyTracker Team
    </p>
@endsection

@section('action_url', $url)
