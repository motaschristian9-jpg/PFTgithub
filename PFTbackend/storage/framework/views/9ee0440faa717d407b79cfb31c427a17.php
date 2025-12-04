<!DOCTYPE html>
<html>
<head>
    <title>Email Verified</title>
    <script>
        setTimeout(function() {
            window.location.href = "<?php echo e($redirect_url); ?>";
        }, 3000);
    </script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen">
    <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div class="mb-6 flex justify-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
        <p class="text-gray-600 mb-8">Your email has been successfully verified. You will be redirected to the login page shortly.</p>
        <a href="<?php echo e($redirect_url); ?>" class="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Continue to Login
        </a>
    </div>
</body>
</html>
<?php /**PATH C:\ReactProjects\PFTMoneyTracker\PFTbackend\resources\views/emails/verified-redirect.blade.php ENDPATH**/ ?>