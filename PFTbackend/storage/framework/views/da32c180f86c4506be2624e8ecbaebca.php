

<?php $__env->startSection('title', 'Reset Your Password'); ?>

<?php $__env->startSection('content'); ?>
    <h1 style="margin:0 0 24px 0;font-size:28px;line-height:36px;font-weight:700;color:#111827;text-align:center;letter-spacing:-0.025em;">
        Reset Your Password
    </h1>
    
    <p style="margin:0 0 16px 0;font-size:16px;line-height:26px;color:#4b5563;">
        Hello,
    </p>
    
    <p style="margin:0 0 32px 0;font-size:16px;line-height:26px;color:#4b5563;">
        We received a request to reset the password for your MoneyTracker account. 
        No worries, we've got you covered!
    </p>
    
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center">
                <a href="<?php echo e($url); ?>" target="_blank" style="display:inline-block;padding:16px 36px;font-size:16px;font-weight:600;color:#ffffff;background-color:#2563EB;text-decoration:none;border-radius:9999px;box-shadow:0 10px 15px -3px rgba(37, 99, 235, 0.3);">
                    Reset Password
                </a>
            </td>
        </tr>
    </table>
    
    <p style="margin:32px 0 0 0;font-size:14px;line-height:22px;color:#6b7280;text-align:center;">
        This link will expire in 60 minutes for your security.
    </p>
    
    <div style="width:100%;height:1px;background-color:#e5e7eb;margin:32px 0;"></div>
    
    <p style="margin:0 0 24px 0;font-size:15px;line-height:24px;color:#4b5563;">
        If you didn't ask to reset your password, you can safely ignore this email. 
        Your account is safe.
    </p>
    
    <p style="margin:0;font-size:16px;line-height:24px;font-weight:600;color:#111827;">
        Best regards,<br>
        The MoneyTracker Team
    </p>
<?php $__env->stopSection(); ?>

<?php $__env->startSection('action_url', $url); ?>
<?php echo $__env->make('emails.layouts.main', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\ReactProjects\PFTMoneyTracker\PFTbackend\resources\views/emails/reset-password.blade.php ENDPATH**/ ?>