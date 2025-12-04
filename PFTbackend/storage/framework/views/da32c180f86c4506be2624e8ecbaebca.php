<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; line-height: 1.6; color: #111827;">
    
    <div style="width: 100%; background-color: #f9fafb; padding: 40px 0;">
        
        <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
            
            <div style="padding: 40px 40px 20px 40px; text-align: center;">
                <a href="<?php echo e(url('/')); ?>" style="text-decoration: none; display: inline-block;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
                        <tr>
                            <td style="vertical-align: middle;">
                                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #22c55e, #15803d); border-radius: 12px; color: #ffffff; font-size: 20px; font-weight: bold; line-height: 40px; text-align: center; box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.3);">
                                    <span style="font-family: sans-serif;">M</span>
                                </div>
                            </td>
                            <td style="vertical-align: middle; padding-left: 12px;">
                                <span style="font-size: 20px; font-weight: 700; color: #1f2937; letter-spacing: -0.025em;">MoneyTracker</span>
                            </td>
                        </tr>
                    </table>
                </a>
            </div>

            <div style="padding: 20px 48px 48px 48px; text-align: center;">
                <h1 style="color: #111827; font-size: 30px; font-weight: 800; margin: 0 0 16px; letter-spacing: -0.025em;">Reset your password</h1>
                
                <p style="margin: 0 0 32px; color: #4b5563; font-size: 16px; line-height: 26px;">
                    We received a request to reset the password for your MoneyTracker account. If you didn't make this request, you can safely ignore this email.
                </p>
                
                <a href="<?php echo e($url); ?>" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 16px 40px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 16px; margin-bottom: 32px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                    Reset password
                </a>
                
                <p style="font-size: 14px; color: #6b7280; margin: 0;">
                    This link will expire in 60 minutes.
                </p>
            </div>
            
            <div style="height: 1px; background-color: #f3f4f6; margin: 0 40px;"></div>

            <div style="padding: 32px 48px; text-align: center;">
                <p style="font-size: 12px; color: #6b7280; margin: 0 0 8px;">
                    Button not working? Copy and paste this link into your browser:
                </p>
                <a href="<?php echo e($url); ?>" style="word-break: break-all; color: #16a34a; font-size: 12px; text-decoration: none; font-weight: 500;">
                    <?php echo e($url); ?>

                </a>
            </div>
        </div>

        <div style="padding: 32px 24px; text-align: center;">
            <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #374151;">
                MoneyTracker
            </p>
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                &copy; <?php echo e(date('Y')); ?> MoneyTracker. All rights reserved.
            </p>
            <div style="margin-top: 16px;">
                <a href="#" style="color: #9ca3af; text-decoration: none; font-size: 12px; margin: 0 8px;">Privacy Policy</a>
                <span style="color: #e5e7eb;">|</span>
                <a href="#" style="color: #9ca3af; text-decoration: none; font-size: 12px; margin: 0 8px;">Terms of Service</a>
            </div>
        </div>
        
    </div>
</body>
</html><?php /**PATH C:\ReactProjects\PFTMoneyTracker\PFTbackend\resources\views/emails/reset-password.blade.php ENDPATH**/ ?>