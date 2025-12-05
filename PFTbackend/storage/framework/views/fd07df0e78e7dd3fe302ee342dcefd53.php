

<?php $__env->startSection('title', 'Goal Reached'); ?>

<?php $__env->startSection('content'); ?>
<h1 style="color:#111827;font-size:24px;font-weight:700;margin:0 0 24px 0;line-height:32px;">
    Goal Reached! 🎉
</h1>

<p style="color:#374151;font-size:16px;line-height:24px;margin:0 0 24px 0;">
    Hello <?php echo e($user->name); ?>,
</p>

<p style="color:#374151;font-size:16px;line-height:24px;margin:0 0 24px 0;">
    Congratulations! You have successfully reached your savings goal for <strong><?php echo e($saving->name); ?></strong>.
</p>

<div style="background-color:#ECFDF5;border:1px solid #A7F3D0;border-radius:12px;padding:24px;margin-bottom:32px;">
    <p style="margin:0 0 8px 0;font-size:14px;color:#065F46;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Goal Details</p>
    <p style="margin:0;font-size:20px;color:#064E3B;font-weight:700;"><?php echo e($saving->name); ?></p>
    <p style="margin:8px 0 0 0;font-size:16px;color:#065F46;">
        Saved: <strong><?php echo e(number_format($saving->current_amount, 2)); ?></strong>
    </p>
</div>

<p style="color:#374151;font-size:16px;line-height:24px;margin:0 0 32px 0;">
    Great job sticking to your plan! What will you save for next?
</p>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width:100%;">
    <tr>
        <td align="center">
            <a href="<?php echo e(config('app.url')); ?>/savings" style="display:inline-block;background-color:#059669;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;padding:16px 32px;border-radius:12px;transition:background-color 0.2s;">
                View Savings
            </a>
        </td>
    </tr>
</table>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('emails.layouts.main', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\ReactProjects\PFTMoneyTracker\PFTbackend\resources\views/emails/saving-completed.blade.php ENDPATH**/ ?>