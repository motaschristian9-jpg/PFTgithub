<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title><?php echo $__env->yieldContent('title'); ?></title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        table, td, div, h1, p, span, a {font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;}
        
        @media screen and (max-width: 530px) {
            .content-padding { padding: 24px !important; }
            .mobile-full-width { width: 100% !important; max-width: 100% !important; }
        }
    </style>
</head>
<body style="margin:0;padding:0;word-spacing:normal;background-color:#f9fafb;">
    
    <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#f9fafb;">
        
        <table role="presentation" style="width:100%;border:none;border-spacing:0;">
            <tr>
                <td align="center" style="padding:40px 10px;">
                    
                    <table role="presentation" class="mobile-full-width" style="width:100%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:'Inter',sans-serif;background-color:#ffffff;border-radius:24px;box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow:hidden;">
                        
                        <tr>
                            <td class="content-padding" style="padding:40px 48px 20px 48px;text-align:center;">
                                <a href="<?php echo e(config('app.url')); ?>" style="text-decoration:none;">
                                    
                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                        <tr>
                                            <td style="padding-right: 12px;">
                                                <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block; width:32px; height:32px;">
                                                    <defs>
                                                        <linearGradient id="logo_gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                                                            <stop offset="0%" stop-color="#2563EB" /> <stop offset="50%" stop-color="#7C3AED" /> <stop offset="100%" stop-color="#0D9488" /> </linearGradient>
                                                    </defs>
                                                    <rect width="40" height="40" rx="12" fill="url(#logo_gradient)" />
                                                    <path d="M11 27V13L20 22L29 13V27" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                            </td>
                                            
                                            <td style="font-size:24px; font-weight:700; letter-spacing:-0.5px; vertical-align:middle;">
                                                <span style="color:#111827;">Money</span><span style="color:#2563EB;">Tracker</span>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                </a>
                            </td>
                        </tr>

                        <tr>
                            <td class="content-padding" style="padding:10px 48px 48px 48px;">
                                <?php echo $__env->yieldContent('content'); ?>
                            </td>
                        </tr>
                        
                    </table>
                    
                    <table role="presentation" style="width:100%;max-width:600px;border:none;border-spacing:0;margin-top:32px;">
                        <tr>
                            <td style="text-align:center;font-size:12px;color:#9ca3af;line-height:20px;font-family:'Inter',sans-serif;">
                                <p style="margin:0 0 12px 0;">&copy; <?php echo e(date('Y')); ?> MoneyTracker. All rights reserved.</p>
                                <p style="margin:0;">
                                    <a href="<?php echo e(config('app.url')); ?>/privacy-policy" style="color:#6b7280;text-decoration:none;margin:0 8px;">Privacy Policy</a>
                                    &bull;
                                    <a href="<?php echo e(config('app.url')); ?>/terms-of-service" style="color:#6b7280;text-decoration:none;margin:0 8px;">Terms of Service</a>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align:center;padding-top:24px;">
                                <p style="margin:0;font-size:12px;color:#d1d5db;word-break:break-all;">
                                    <?php echo $__env->yieldContent('action_url'); ?>
                                </p>
                            </td>
                        </tr>
                    </table>

                </td>
            </tr>
        </table>
    </div>
</body>
</html><?php /**PATH /var/www/resources/views/emails/layouts/main.blade.php ENDPATH**/ ?>