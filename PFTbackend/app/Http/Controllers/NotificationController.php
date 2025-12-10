<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Auto-Prune: Delete notifications older than 30 days
        $user->notifications()
            ->where('created_at', '<', now()->subDays(30))
            ->delete();

        // Fetch notifications
        $notifications = $user->notifications()->latest()->take(20)->get();
        
        return response()->json([
            'data' => $notifications
        ]);
    }

    public function destroy($id)
    {
        $notification = Auth::user()->notifications()->findOrFail($id);
        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }
}
