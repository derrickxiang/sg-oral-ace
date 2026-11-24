import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createFeedback,
  checkUserDailyLimit,
  updateFeedbackStatus,
  getUserFeedbacks,
  getAllFeedbacks,
  deleteUserFeedbacks,
} from './feedbackService.ts';

test('createFeedback creates valid feedback item with 90-day retention', async () => {
  const testUserId = `test_student_${Date.now()}`;
  const res = await createFeedback({
    userId: testUserId,
    userEmail: 'student@example.com',
    type: 'content_safety',
    description: 'This is a test content safety report for Singapore oral topic.',
    contactEmail: 'parent@example.com',
    topicTitle: '小贩中心主动归还托盘',
    autoContext: {
      language: 'zh',
      browser: 'TestBrowser 1.0',
      topicTitle: '小贩中心主动归还托盘',
    },
  });

  assert.equal(res.success, true);
  assert.ok(res.feedback);
  assert.ok(res.feedback.id.startsWith('FB-'));
  assert.equal(res.feedback.type, 'content_safety');
  assert.equal(res.feedback.status, 'pending');
  assert.equal(res.feedback.topicTitle, '小贩中心主动归还托盘');
  assert.ok(new Date(res.feedback.expiresAt).getTime() > Date.now() + 89 * 86400 * 1000);

  // Check user retrieval
  const userItems = getUserFeedbacks(testUserId);
  assert.equal(userItems.length, 1);
  assert.equal(userItems[0].id, res.feedback.id);

  // Clean up
  deleteUserFeedbacks(testUserId);
});

test('checkUserDailyLimit limits each user to 5 submissions per day', async () => {
  const limitUserId = `rate_test_${Date.now()}`;

  for (let i = 0; i < 5; i++) {
    const res = await createFeedback({
      userId: limitUserId,
      type: 'feature_issue',
      description: `Test report #${i + 1}`,
      autoContext: { language: 'zh', browser: 'Test' },
    });
    assert.equal(res.success, true);
  }

  // 6th submission should be rejected with daily rate limit
  const res6 = await createFeedback({
    userId: limitUserId,
    type: 'feature_issue',
    description: 'Test report #6 exceeds limit',
    autoContext: { language: 'zh', browser: 'Test' },
  });

  assert.equal(res6.success, false);
  assert.ok(res6.error?.includes('最多提交 5 条'));

  // Clean up
  deleteUserFeedbacks(limitUserId);
});

test('updateFeedbackStatus updates status and records admin reply', async () => {
  const updateUserId = `admin_test_${Date.now()}`;
  const res = await createFeedback({
    userId: updateUserId,
    type: 'privacy_data_request',
    description: 'Please delete my practice data.',
    autoContext: { language: 'en', browser: 'Test' },
  });

  assert.ok(res.feedback);
  const fbId = res.feedback.id;

  const updateRes = updateFeedbackStatus(
    fbId,
    'resolved',
    '您的历史练习数据已在服务器本地完成清空处理。'
  );

  assert.equal(updateRes.success, true);
  assert.equal(updateRes.feedback?.status, 'resolved');
  assert.ok(updateRes.feedback?.adminReply?.includes('清空处理'));
  assert.ok(updateRes.feedback?.adminRepliedAt);

  // Clean up
  deleteUserFeedbacks(updateUserId);
});
