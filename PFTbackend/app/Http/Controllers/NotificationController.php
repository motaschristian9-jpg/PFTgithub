<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Fetch notifications, maybe paginate them
        $notifications = $user->notifications()->latest()->take(20)->get();
        
        return response()->json([
            'data' => $notifications
        ]);
    }
}
