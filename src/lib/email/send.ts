import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend(): Resend {
    if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || '');
    return _resend;
}

const FROM = process.env.EMAIL_FROM || 'VibeCoder <notifications@vibecoder.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vibecoder.com';

export interface DigestData {
    builderName: string;
    username: string;
    newViews: number;
    newHireRequests: number;
    newReviews: number;
    leaderboardRank: number | null;
    newEndorsements: number;
}

function digestHtml(data: DigestData): string {
    const profileUrl = `${APP_URL}/m/${data.username}`;
    const managerUrl = `${APP_URL}/manager`;
    const unsubUrl = `${APP_URL}/manager`; // Users manage preferences in manager

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fbfbfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:500px;margin:0 auto;padding:40px 20px;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:32px;">
        <div style="width:12px;height:12px;background:#d80018;"></div>
        <span style="font-size:14px;color:#9b9a97;font-family:monospace;text-transform:uppercase;letter-spacing:0.15em;">VibeCoder Weekly</span>
    </div>
    
    <h1 style="font-size:24px;font-weight:400;color:#37352f;margin:0 0 8px 0;font-family:Georgia,serif;">Hey ${data.builderName} 👋</h1>
    <p style="font-size:14px;color:#9b9a97;margin:0 0 32px 0;font-family:monospace;">Here's your week in review.</p>
    
    <div style="background:white;border:1px solid #ededeb;border-radius:8px;overflow:hidden;">
        ${data.newViews > 0 ? `
        <div style="padding:16px 20px;border-bottom:1px solid #ededeb;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;color:#9b9a97;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;">Profile Views</span>
            <span style="font-size:20px;font-weight:700;color:#37352f;font-family:monospace;">${data.newViews}</span>
        </div>` : ''}
        ${data.newHireRequests > 0 ? `
        <div style="padding:16px 20px;border-bottom:1px solid #ededeb;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;color:#d80018;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;">New Hire Requests</span>
            <span style="font-size:20px;font-weight:700;color:#d80018;font-family:monospace;">${data.newHireRequests}</span>
        </div>` : ''}
        ${data.newReviews > 0 ? `
        <div style="padding:16px 20px;border-bottom:1px solid #ededeb;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;color:#9b9a97;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;">New Reviews</span>
            <span style="font-size:20px;font-weight:700;color:#37352f;font-family:monospace;">${data.newReviews}</span>
        </div>` : ''}
        ${data.newEndorsements > 0 ? `
        <div style="padding:16px 20px;border-bottom:1px solid #ededeb;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;color:#9b9a97;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;">Endorsements</span>
            <span style="font-size:20px;font-weight:700;color:#37352f;font-family:monospace;">${data.newEndorsements}</span>
        </div>` : ''}
        ${data.leaderboardRank ? `
        <div style="padding:16px 20px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;color:#9b9a97;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;">Leaderboard Rank</span>
            <span style="font-size:20px;font-weight:700;color:#37352f;font-family:monospace;">#${data.leaderboardRank}</span>
        </div>` : ''}
    </div>
    
    <div style="margin-top:32px;text-align:center;">
        <a href="${managerUrl}" style="display:inline-block;background:#d80018;color:white;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:13px;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;">View Dashboard</a>
    </div>
    
    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #ededeb;text-align:center;">
        <a href="${profileUrl}" style="font-size:11px;color:#9b9a97;font-family:monospace;text-decoration:none;">Your Profile</a>
        <span style="color:#ededeb;margin:0 8px;">·</span>
        <a href="${unsubUrl}" style="font-size:11px;color:#9b9a97;font-family:monospace;text-decoration:none;">Email Preferences</a>
    </div>
</div>
</body>
</html>`;
}

function hireRequestHtml(data: { builderName: string; seekerName: string; description: string; issueUrl: string; username: string }): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fbfbfa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:500px;margin:0 auto;padding:40px 20px;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:32px;">
        <div style="width:12px;height:12px;background:#d80018;"></div>
        <span style="font-size:14px;color:#9b9a97;font-family:monospace;text-transform:uppercase;letter-spacing:0.15em;">VibeCoder</span>
    </div>
    <h1 style="font-size:20px;font-weight:400;color:#37352f;margin:0 0 8px 0;font-family:Georgia,serif;">New Hire Request 🔔</h1>
    <p style="font-size:14px;color:#9b9a97;margin:0 0 24px 0;font-family:monospace;">${data.seekerName} wants to hire you.</p>
    <div style="background:white;border:1px solid #ededeb;border-radius:8px;padding:20px;">
        <p style="font-size:14px;color:#37352f;margin:0;line-height:1.6;">${data.description.slice(0, 300)}${data.description.length > 300 ? '…' : ''}</p>
    </div>
    <div style="margin-top:24px;text-align:center;">
        <a href="${data.issueUrl}" style="display:inline-block;background:#d80018;color:white;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:13px;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em;">View & Reply on GitHub</a>
    </div>
    <p style="font-size:11px;color:#9b9a97;font-family:monospace;text-align:center;margin-top:24px;">
        <a href="${APP_URL}/manager" style="color:#9b9a97;text-decoration:none;">Email Preferences</a>
    </p>
</div>
</body>
</html>`;
}

/** Send weekly digest email */
export async function sendDigest(email: string, data: DigestData): Promise<boolean> {
    if (!process.env.RESEND_API_KEY) return false;
    try {
        const { error } = await getResend().emails.send({
            from: FROM,
            to: email,
            subject: `Your VibeCoder week: ${data.newViews} views${data.newHireRequests ? `, ${data.newHireRequests} hire requests` : ''}`,
            html: digestHtml(data),
        });
        return !error;
    } catch {
        return false;
    }
}

/** Send instant hire request notification */
export async function sendHireRequestNotification(
    email: string,
    data: { builderName: string; seekerName: string; description: string; issueUrl: string; username: string },
): Promise<boolean> {
    if (!process.env.RESEND_API_KEY) return false;
    try {
        const { error } = await getResend().emails.send({
            from: FROM,
            to: email,
            subject: `New hire request from ${data.seekerName}`,
            html: hireRequestHtml(data),
        });
        return !error;
    } catch {
        return false;
    }
}
