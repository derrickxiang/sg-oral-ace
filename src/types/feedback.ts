export type FeedbackType = 'feature_issue' | 'content_safety' | 'privacy_data_request';

export type FeedbackStatus = 'pending' | 'in_progress' | 'resolved';

export interface FeedbackAutoContext {
  submittedAt: string;
  appVersion: string;
  language: 'zh' | 'en';
  browser: string;
  topicTitle?: string;
}

export interface FeedbackItem {
  id: string; // e.g. "FB-20261108-A9B1"
  userId: string;
  userEmail?: string;
  type: FeedbackType;
  description: string;
  contactEmail?: string;
  topicTitle?: string;
  autoContext: FeedbackAutoContext;
  status: FeedbackStatus;
  adminReply?: string;
  adminRepliedAt?: string;
  createdAt: string;
  expiresAt: string; // 90 days retention
}

export interface FeedbackSubmissionPayload {
  userId: string;
  userEmail?: string;
  type: FeedbackType;
  description: string;
  contactEmail?: string;
  topicTitle?: string;
  autoContext: {
    language: 'zh' | 'en';
    browser: string;
    topicTitle?: string;
  };
}

export interface AdminFeedbackUpdateRequest {
  feedbackId: string;
  status: FeedbackStatus;
  adminReply?: string;
}

export const FEEDBACK_TYPE_METADATA: Record<
  FeedbackType,
  {
    labelZh: string;
    labelEn: string;
    slaHoursZh: string;
    slaHoursEn: string;
    descriptionZh: string;
    descriptionEn: string;
    badgeColor: string;
  }
> = {
  content_safety: {
    labelZh: '内容安全举报',
    labelEn: 'Content Safety Report',
    slaHoursZh: '24 小时内首次响应',
    slaHoursEn: 'First response within 24 hours',
    descriptionZh: '发现不当、失实或有害表达，优先加急处理',
    descriptionEn: 'Report inappropriate or unsafe responses',
    badgeColor: 'border-rose-300 bg-rose-50 text-rose-800',
  },
  privacy_data_request: {
    labelZh: '隐私或数据请求',
    labelEn: 'Privacy & Data Request',
    slaHoursZh: '3 个工作日内处理',
    slaHoursEn: 'Processed within 3 days',
    descriptionZh: '个人信息更正、数据调取或账号记录注销请求',
    descriptionEn: 'Personal data correction, export, or deletion',
    badgeColor: 'border-amber-300 bg-amber-50 text-amber-800',
  },
  feature_issue: {
    labelZh: '功能问题与建议',
    labelEn: 'Feature Issue / Bug',
    slaHoursZh: '3 个工作日内回复或排期',
    slaHoursEn: 'Addressed within 3 working days',
    descriptionZh: '录音识别、音频播放、页面排版等使用异常',
    descriptionEn: 'Audio playback, recording, or layout issues',
    badgeColor: 'border-teal-300 bg-teal-50 text-teal-800',
  },
};
