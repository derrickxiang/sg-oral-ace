import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectPronunciationIssues,
  analyzeOralTranscript,
  determineBand,
  generateTripleFeedback,
  compareAttempts,
  getReadingAloudPassage,
  evaluateReadingAloud,
  getSuggestedOridKeywordsForTopic,
  getProgressiveFollowUpQuestion,
  computeClassCohortInsights,
  generateClassReportCsv,
  PRONUNCIATION_AND_POLICY_QUIZ_BANK,
  computeOnDeviceAcousticGopTelemetry,
  getDifficultyScaffolding,
} from './seabRubric';
import { EvaluationResult } from '../types/oral';

test('detectPronunciationIssues detects common Singapore Chinese phonetic traps', () => {
  const sampleSpeech = '在这次活动中，每个中学生都扮演着重要的角色，而且我们要提供志愿服务，尽量减少塑料垃圾。';
  const issues = detectPronunciationIssues(sampleSpeech);

  assert.ok(issues.length >= 3, `Expected at least 3 issues, got ${issues.length}`);
  const words = issues.map(i => i.word);
  assert.ok(words.includes('角色'), 'Should detect "角色"');
  assert.ok(words.includes('提供'), 'Should detect "提供"');
  assert.ok(words.includes('塑料'), 'Should detect "塑料"');
  assert.ok(words.includes('垃圾'), 'Should detect "垃圾"');
});

test('analyzeOralTranscript checks word count, connectors, and multi-angle analysis', () => {
  const shortTranscript = '我觉得挺好的，大家要做好事。';
  const shortAnalysis = analyzeOralTranscript(shortTranscript);
  assert.ok(shortAnalysis.wordCount < 40);
  assert.equal(shortAnalysis.hasPersonalExample, false);

  const richTranscript = `
    看了这个短片，我深有感触。我认为小贩中心归还托盘不仅是个人公德心的体现，更关乎对乐龄清洁工的体谅。
    之所以会出现不归还的现象，其根本原因在于部分人抱有侥幸心理。
    以我身边的经历为例，有一次我和家人在勿洛小贩中心用餐，看到清洁工阿伯推着沉重的车，我便主动上前协助归还。
    因此，从学校教育与政府法律的角度来看，必须双管齐下。学校应从小培养学生的同理心，政府也应加强督导。
    总的来说，长远来看，唯有大家共同努力，才能建设优雅社会。
  `;
  const richAnalysis = analyzeOralTranscript(richTranscript);
  assert.ok(richAnalysis.wordCount > 100);
  assert.equal(richAnalysis.hasPersonalExample, true);
  assert.equal(richAnalysis.hasMultiAngle, true);
  assert.ok(richAnalysis.connectorsFound.length >= 3);
  assert.ok(richAnalysis.totalScore > shortAnalysis.totalScore);
});

test('determineBand maps scores to appropriate SEAB bands', () => {
  assert.equal(determineBand(45), 'Band 1 (极佳 42-50)');
  assert.equal(determineBand(36), 'Band 2 (优良 34-41)');
  assert.equal(determineBand(28), 'Band 3 (尚可 25-33)');
  assert.equal(determineBand(18), 'Band 4 (待努力 0-24)');
});

test('generateTripleFeedback produces all 3 required feedback dimensions', () => {
  const transcript = '我认为保护环境很重要，大家不要乱丢垃圾。';
  const analysis = analyzeOralTranscript(transcript);
  const feedback = generateTripleFeedback(transcript, analysis, '绿色环保');

  assert.ok(feedback.clearExpression.summary.length > 0);
  assert.ok(feedback.missingReasons.summary.length > 0);
  assert.ok(feedback.missingReasons.gaps.length > 0);
  assert.ok(feedback.nextTimeImprovements.actionableSteps.length > 0);
  assert.ok(feedback.nextTimeImprovements.oridFrameworkExample.objective.length > 0);
});

test('compareAttempts correctly compares before and after attempts', () => {
  const dummyResult1: EvaluationResult = {
    id: 'r1',
    topicId: 't1',
    topicTitle: '小贩中心主动归还托盘',
    createdAt: new Date().toISOString(),
    totalScore: 30,
    band: 'Band 3 (尚可 25-33)',
    rubric: {
      content: { name: '思想内容', score: 9, maxScore: 15, level: '尚可 (Band 3)', feedback: '', keyObservations: [] },
      expression: { name: '表达与结构', score: 9, maxScore: 15, level: '尚可 (Band 3)', feedback: '', keyObservations: [] },
      vocabulary: { name: '词汇语料', score: 6, maxScore: 10, level: '尚可 (Band 3)', feedback: '', keyObservations: [] },
      pronunciation: { name: '语音发音', score: 6, maxScore: 10, level: '尚可 (Band 3)', feedback: '', keyObservations: [] },
    },
    tripleFeedback: {} as any,
    pronunciationIssues: [{ word: '角色', pinyin: 'jué sè', explanation: '', toneInfo: '', category: 'polyphone' }],
    corpusSuggestions: {} as any,
    initialTranscript: '我认为要归还托盘，因为这是好事。',
    audioDurationSeconds: 25,
  };

  const dummyResult2: EvaluationResult = {
    ...dummyResult1,
    id: 'r2',
    totalScore: 39,
    band: 'Band 2 (优良 34-41)',
    rubric: {
      content: { name: '思想内容', score: 12, maxScore: 15, level: '优良 (Band 2)', feedback: '', keyObservations: [] },
      expression: { name: '表达与结构', score: 12, maxScore: 15, level: '优良 (Band 2)', feedback: '', keyObservations: [] },
      vocabulary: { name: '词汇语料', score: 8, maxScore: 10, level: '优良 (Band 2)', feedback: '', keyObservations: [] },
      pronunciation: { name: '语音发音', score: 7, maxScore: 10, level: '优良 (Band 2)', feedback: '', keyObservations: [] },
    },
    initialTranscript: '看了短片，我认为小贩中心归还托盘能减轻清洁阿伯负担。之所以有人不归还，是因为缺乏公德心。从家庭和学校角度应双管齐下。',
    pronunciationIssues: [],
  };

  const comparison = compareAttempts(dummyResult1, dummyResult2);
  assert.equal(comparison.scoreDifference, 9);
  assert.ok(comparison.contentGains.length > 0);
  assert.ok(comparison.examinerVerdict.includes('显著飞跃'));
  assert.ok(comparison.pronunciationFixes.some(f => f.includes('角色')));
});

test('ORAL_TOPICS contains 20 authentic Singapore O-Level topics including real video seat-land.mp4', async () => {
  const { ORAL_TOPICS } = await import('../data/topics');
  assert.equal(ORAL_TOPICS.length, 20);
  const mrtTopic = ORAL_TOPICS.find(t => t.id === 'topic-public-transport-seat');
  assert.ok(mrtTopic, 'Should include topic-public-transport-seat');
  assert.equal(mrtTopic.realVideoUrl, '/video/seat-land.mp4');
  for (const topic of ORAL_TOPICS) {
    assert.equal(topic.scenes.length, 4, `Topic ${topic.id} should have 4 scenes`);
  }
});

test('evaluateReadingAloud scores 10-mark Part 1 Reading Aloud accurately and computes acoustic GOP telemetry', () => {
  const passage = getReadingAloudPassage('topic-hawker-tray');
  assert.ok(passage.passage.length > 80);

  const fullEval = evaluateReadingAloud(passage, passage.passage, 38);
  assert.equal(fullEval.maxScore, 10);
  assert.equal(fullEval.accuracyPercent, 100);
  assert.equal(fullEval.score, 10);
  assert.equal(fullEval.missedWords.length, 0);
  assert.ok(fullEval.acousticTelemetry, 'Should attach acousticTelemetry');
  assert.equal(fullEval.acousticTelemetry.networkRequestCount, 0);

  const partialEval = evaluateReadingAloud(passage, '星期天中午，社区小贩中心里人山人海。', 12);
  assert.ok(partialEval.score < fullEval.score);
  assert.ok(partialEval.missedWords.length > 0);
});

test('computeOnDeviceAcousticGopTelemetry and getDifficultyScaffolding work deterministically', () => {
  const telemetry = computeOnDeviceAcousticGopTelemetry(
    '在地铁上每个乘客都扮演着重要角色，我们要提供帮助，减少塑料垃圾，潜移默化地体谅长辈。',
    18
  );
  assert.equal(telemetry.networkRequestCount, 0);
  assert.ok(telemetry.totalDurationSec >= 18);
  assert.ok(telemetry.speechRateCharsPerSec > 0);
  assert.ok(telemetry.pauseCountOver300ms >= 1);
  assert.ok(telemetry.characterSegments.length > 0);
  assert.ok(telemetry.phonemeGopSegments.some(p => p.flagged), 'Should flag low-confidence phonemes < -5.0');

  const basic = getDifficultyScaffolding('公共交通上的礼让与体谅', 'basic');
  const advanced = getDifficultyScaffolding('公共交通上的礼让与体谅', 'advanced');
  assert.equal(basic.sentenceFrames.length, 4);
  assert.equal(advanced.sentenceFrames.length, 3);
  assert.notEqual(basic.badgeZh, advanced.badgeZh);
});

test('getSuggestedOridKeywordsForTopic, getProgressiveFollowUpQuestion, and computeClassCohortInsights work deterministically', () => {
  const orid = getSuggestedOridKeywordsForTopic('topic-hawker-tray');
  assert.ok(orid.observation.length > 5);
  assert.ok(orid.decision.includes('VIA'));

  const r1 = getProgressiveFollowUpQuestion('topic-hawker-tray', 1);
  const r2 = getProgressiveFollowUpQuestion('topic-hawker-tray', 2);
  const r3 = getProgressiveFollowUpQuestion('topic-hawker-tray', 3);
  assert.notEqual(r1.question, r2.question);
  assert.notEqual(r2.question, r3.question);

  const cohort = computeClassCohortInsights('MOE-SEC4', []);
  assert.equal(cohort.schoolCode, 'MOE-SEC4');
  assert.ok(cohort.totalStudents >= 5);
  const csv = generateClassReportCsv(cohort);
  assert.ok(csv.includes('Student ID,Student Name'));
  assert.ok(PRONUNCIATION_AND_POLICY_QUIZ_BANK.length >= 6);
});

test('FREE_TRIAL_TOPIC_COUNT is 2 and SEAB_THEMATIC_DOMAINS covers all 20 ORAL_TOPICS', async () => {
  const { FREE_TRIAL_TOPIC_COUNT, SEAB_THEMATIC_DOMAINS } = await import('../components/TopicSelectorDeck');
  const { ORAL_TOPICS } = await import('../data/topics');
  assert.equal(FREE_TRIAL_TOPIC_COUNT, 2);
  assert.equal(SEAB_THEMATIC_DOMAINS.length, 5);
  const mappedIds = SEAB_THEMATIC_DOMAINS.flatMap((d) => d.topicIds);
  assert.equal(mappedIds.length, 20);
  for (const topic of ORAL_TOPICS) {
    assert.ok(mappedIds.includes(topic.id), `Topic ${topic.id} should belong to a SEAB thematic domain`);
  }
});

