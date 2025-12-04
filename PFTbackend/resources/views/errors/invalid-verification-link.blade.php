<!DOCTYPE html>
<html>
<head>
    <title>Invalid Link</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen">
    <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div class="mb-6 flex justify-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </div>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
        <p class="text-gray-600 mb-8">The verification link is invalid or has expired. Please request a new one.</p>
        <a href="http://localhost:5173/email/verify" class="inline-block w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
            Request New Link
        </a>
    </div>
</body>
</html>
