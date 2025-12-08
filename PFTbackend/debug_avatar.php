<?php

use App\Models\User;
use Illuminate\Support\Facades\Storage;

// Set a dummy avatar path
$user = new User();
$user->avatar = 'avatars/test.jpg';

echo "Avatar Path: " . $user->avatar . PHP_EOL;
echo "Storage URL: " . Storage::url($user->avatar) . PHP_EOL;

// Check array serialization
$array = $user->toArray();
echo "JSON Output: " . json_encode($array, JSON_PRETTY_PRINT) . PHP_EOL;
