<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title')</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .card {
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            overflow: hidden;
        }
        .header {
            text-align: center;
            padding: 32px 0;
            background: linear-gradient(to right, #eff6ff, #f5f3ff);
        }
        .logo {
            font-size: 24px;
            font-weight: 800;
            color: #2563eb;
            text-decoration: none;
            display: inline-block;
        }
        .logo span {
            background: linear-gradient(to right, #2563eb, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .content {
            padding: 40px;
            color: #374151;
            line-height: 1.6;
        }
        .h1 {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 16px;
            text-align: center;
        }
        .text {
            margin-bottom: 24px;
            font-size: 16px;
            color: #4b5563;
        }
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(to right, #2563eb, #7c3aed);
            color: #ffffff;
            font-weight: 600;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
            transition: transform 0.2s;
        }
        .footer {
            text-align: center;
            padding-top: 24px;
            color: #9ca3af;
            font-size: 12px;
        }
        .footer a {
            color: #6b7280;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <a href="{{ config('app.url') }}" class="logo">
                    <span>MoneyTracker</span>
                </a>
            </div>
            
            <div class="content">
                @yield('content')
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} MoneyTracker. All rights reserved.</p>
            <p>
                If you're having trouble clicking the button, copy and paste the URL below into your web browser:<br>
                <span style="word-break: break-all; color: #6b7280;">@yield('action_url')</span>
            </p>
        </div>
    </div>
</body>
</html>
