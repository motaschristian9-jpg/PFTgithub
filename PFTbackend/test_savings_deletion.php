<?php

use App\Models\User;
use App\Models\Saving;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\SavingController;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Create Test User
$user = User::firstOrCreate(
    ['email' => 'test_deletion@example.com'],
    ['name' => 'Test User', 'password' => bcrypt('password')]
);
Auth::login($user);

// Create Saving Goal
$saving = Saving::create([
    'user_id' => $user->id,
    'name' => 'Test Saving Goal',
    'target_amount' => 100,
    'current_amount' => 10,
]);

echo "Created Saving: " . $saving->id . "\n";

// Create Linked Transaction (Expense)
$transaction = Transaction::create([
    'user_id' => $user->id,
    'name' => 'Transfer to ' . $saving->name,
    'type' => 'expense',
    'amount' => 10,
    'date' => now(),
    'saving_goal_id' => $saving->id,
]);

echo "Created Transaction: " . $transaction->id . " linked to Saving: " . $transaction->saving_goal_id . "\n";

// Simulate Deletion Request
$request = Request::create('/api/savings/' . $saving->id . '?refund_transactions=true', 'DELETE');

// Instantiate Controller
$controller = new SavingController();

// Execute Destroy Logic Manually (to avoid routing complexity in script)
echo "Attempting deletion...\n";

if ($request->query('refund_transactions') === 'true') {
    echo "Refund param is true.\n";
    $deleted = $saving->transactions()
        ->where(function ($query) {
            $query->where('type', 'expense')
                  ->orWhere(function ($q) {
                      $q->where('type', 'income')
                        ->where('name', 'like', 'Withdrawal:%');
                  });
        })
        ->delete();
    echo "Deleted transactions count: " . $deleted . "\n";
}

$saving->delete();
echo "Saving deleted.\n";

// Verify Transaction Status
$checkTx = Transaction::find($transaction->id);
if ($checkTx) {
    echo "FAILURE: Transaction " . $transaction->id . " still exists!\n";
    echo "Saving Goal ID on Tx: " . ($checkTx->saving_goal_id ?? 'NULL') . "\n";
} else {
    echo "SUCCESS: Transaction deleted.\n";
}
