<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Already Verified</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: white;
        }
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            max-width: 400px;
        }
        .info-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        .message {
            font-size: 1.2rem;
            margin-bottom: 1rem;
        }
        .help-text {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-bottom: 1.5rem;
        }
        .button {
            background: white;
            color: #4ecdc4;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 5px;
            text-decoration: none;
            display: inline-block;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        .button:hover {
            background: rgba(255, 255, 255, 0.9);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="info-icon">ℹ️</div>
        <div class="message">Email Already Verified</div>
        <div class="help-text">
            Your email address has already been verified. You can now sign in to your account.
        </div>
        <a href="http://localhost:5173/login" class="button">
            Go to Login
        </a>
    </div>

    <script>
        // Auto redirect after 3 seconds
        setTimeout(function() {
            window.location.href = 'http://localhost:5173/login';
        }, 3000);
    </script>
</body>
</html>
