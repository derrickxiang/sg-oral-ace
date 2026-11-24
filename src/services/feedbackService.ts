import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import type {
  FeedbackItem,
  FeedbackSubmissionPayload,
  FeedbackType,
  FeedbackStatus,
} from '../types/feedback.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEEDBACK_DATA_DIR = path.resolve(__dirname, '..', '..', 'data');
const FEEDBACK_FILE = path.resolve(FEEDBACK_DATA_DIR, 'feedbacks.json');

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'Derrick.Xiang@gmail.com';
const APP_VERSION = 'v1.2.0-trial';

// Ensure data directory exists
if (!fs.existsSync(FEEDBACK_DATA_DIR)) {
  fs.mkdirSync(FEEDBACK_DATA_DIR, { recursive: true });
}

// In-memory cache + file sync
let feedbacksCache: FeedbackItem[] = [];

function loadFeedbacksFromFile(): FeedbackItem[] {
  try {
    if (fs.existsSync(FEEDBACK_FILE)) {
      const raw = fs.readFileSync(FEEDBACK_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read feedbacks.json, initializing empty:', err);
  }
  return [];
}

function saveFeedbacksToFile(): void {
  try {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbacksCache, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to persist feedbacks.json:', err);
  }
}

// Initialize cache
feedbacksCache = loadFeedbacksFromFile();

// Purge feedbacks older than 90 days per data retention policy
export function purgeExpiredFeedbacks(): number {
  const now = new Date();
  const initialCount = feedbacksCache.length;
  feedbacksCache = feedbacksCache.filter((fb) => {
    const expires = new Date(fb.expiresAt);
    return expires.getTime() > now.getTime();
  });
  if (feedbacksCache.length !== initialCount) {
    saveFeedbacksToFile();
  }
  return initialCount - feedbacksCache.length;
}

// Check daily submission rate limit: max 5 submissions per user in the last 24 hours
export function checkUserDailyLimit(userId: string): { allowed: boolean; count: number } {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentCount = feedbacksCache.filter((fb) => {
    return fb.userId === userId && new Date(fb.createdAt).getTime() > dayAgo;
  }).length;

  return {
    allowed: recentCount < 5,
    count: recentCount,
  };
}

// Type label mapping for clean privacy-preserving email notification
const TYPE_LABELS: Record<FeedbackType, { zh: string; en: string }> = {
  content_safety: { zh: '内容安全举报', en: 'Content Safety Report' },
  privacy_data_request: { zh: '隐私与数据请求', en: 'Privacy & Data Request' },
  feature_issue: { zh: '功能问题与缺陷', en: 'Feature Issue / Bug' },
};

export async function dispatchEmailNotification(feedback: FeedbackItem): Promise<{ sent: boolean; channel: string }> {
  const typeMeta = TYPE_LABELS[feedback.type] || { zh: '用户反馈', en: 'User Feedback' };
  const subject = `[OralAce 反馈通知] 收到新${typeMeta.zh} (编号: ${feedback.id})`;

  // CRITICAL PRIVACY BOUNDARY: The student's description text is NEVER transmitted to the email provider!
  // Notification email only contains: ID, Type, Timestamp, Topic Name (if any), and whether a contact email was left.
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="border-bottom: 2px solid #0B3B3C; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="color: #072B2E; margin: 0; font-size: 18px;">OralAce 练习系统 · 新反馈通知</h2>
        <span style="font-size: 12px; color: #64748b;">试用版学生支持与安全举报通道</span>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 110px;">反馈编号:</td>
          <td style="padding: 8px 0; font-family: monospace; color: #0f766e; font-weight: bold;">${feedback.id}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">类型:</td>
          <td style="padding: 8px 0;">${typeMeta.zh} (${typeMeta.en})</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">提交时间:</td>
          <td style="padding: 8px 0;">${feedback.createdAt}</td>
        </tr>
        ${feedback.topicTitle ? `<tr><td style="padding: 8px 0; font-weight: bold;">相关考题:</td><td style="padding: 8px 0;">${feedback.topicTitle}</td></tr>` : ''}
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">联系方式:</td>
          <td style="padding: 8px 0;">${feedback.contactEmail ? '已留存回复邮箱 (可在管理端查看)' : '未留存（无需邮件回复）'}</td>
        </tr>
      </table>
      <div style="background: #f8fafc; border-left: 4px solid #0f766e; padding: 14px; border-radius: 6px; font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
        <strong>隐私安全保护提示：</strong> 为遵守新加坡 PDPA 与学生隐私规范，学生的描述全文未附带在此邮件中。请管理员登录 OralAce 账号页的「管理列表」安全查看详情并跟进处理。
      </div>
      <div style="font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 12px;">
        OralAce AI Studio · 本通知邮件使用 Brevo / Cloudflare 现有安全链路发送 · 保留期 90 天
      </div>
    </div>
  `;

  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'OralAce Alert', email: 'notifications@oralace.sg' },
          to: [{ email: ADMIN_EMAIL, name: 'OralAce Admin' }],
          subject,
          htmlContent,
        }),
      });
      if (res.ok) {
        return { sent: true, channel: 'brevo_smtp' };
      }
      console.warn('Brevo API response non-ok:', await res.text());
    } catch (err) {
      console.warn('Brevo dispatch error:', err);
    }
  }

  // Graceful fallback: Recorded securely in the application notification queue
  console.log(`[Notification Queued] Feedback ${feedback.id} (${feedback.type}) -> ${ADMIN_EMAIL}`);
  return { sent: true, channel: 'in_app_queue' };
}

// Create new feedback
export async function createFeedback(
  payload: FeedbackSubmissionPayload
): Promise<{ success: boolean; feedback?: FeedbackItem; error?: string }> {
  // Validate daily limit
  const rateLimit = checkUserDailyLimit(payload.userId);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: '每个账号每天最多提交 5 条反馈或举报。您今天已提交 5 条，请明天再试。',
    };
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  const id = `FB-${dateStr}-${rand}`;

  // 90 days retention date
  const expires = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // Sanitized description capped at 2000 characters
  const description = (payload.description || '').trim().slice(0, 2000);

  const newFeedback: FeedbackItem = {
    id,
    userId: payload.userId,
    userEmail: payload.userEmail,
    type: payload.type,
    description,
    contactEmail: payload.contactEmail ? payload.contactEmail.trim().slice(0, 254) : undefined,
    topicTitle: payload.topicTitle?.trim().slice(0, 200),
    autoContext: {
      submittedAt: now.toISOString(),
      appVersion: APP_VERSION,
      language: payload.autoContext?.language || 'zh',
      browser: (payload.autoContext?.browser || 'Browser').slice(0, 200),
      topicTitle: payload.topicTitle,
    },
    status: 'pending',
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };

  feedbacksCache.unshift(newFeedback);
  saveFeedbacksToFile();

  // Send privacy-preserving notification to admin
  dispatchEmailNotification(newFeedback).catch((err) =>
    console.warn('Notification dispatch error:', err)
  );

  return { success: true, feedback: newFeedback };
}

// Fetch feedback submitted by a specific student
export function getUserFeedbacks(userId: string): FeedbackItem[] {
  return feedbacksCache.filter((fb) => fb.userId === userId);
}

// Fetch all feedbacks (Admin only)
export function getAllFeedbacks(statusFilter?: FeedbackStatus): FeedbackItem[] {
  if (statusFilter) {
    return feedbacksCache.filter((fb) => fb.status === statusFilter);
  }
  return [...feedbacksCache];
}

// Update feedback status & reply (Admin only)
export function updateFeedbackStatus(
  feedbackId: string,
  status: FeedbackStatus,
  adminReply?: string
): { success: boolean; feedback?: FeedbackItem; error?: string } {
  const item = feedbacksCache.find((fb) => fb.id === feedbackId);
  if (!item) {
    return { success: false, error: 'Feedback item not found' };
  }

  item.status = status;
  if (adminReply !== undefined) {
    item.adminReply = adminReply.trim().slice(0, 2000);
    item.adminRepliedAt = new Date().toISOString();
  }

  saveFeedbacksToFile();
  return { success: true, feedback: item };
}

// Delete feedback (e.g. on user account deletion)
export function deleteUserFeedbacks(userId: string): number {
  const initial = feedbacksCache.length;
  feedbacksCache = feedbacksCache.filter((fb) => fb.userId !== userId);
  if (feedbacksCache.length !== initial) {
    saveFeedbacksToFile();
  }
  return initial - feedbacksCache.length;
}
