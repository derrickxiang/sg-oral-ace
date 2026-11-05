import {
  EvaluationResult,
  CoreTripleFeedback,
  PronunciationIssue,
  CorpusSuggestion,
  ComparisonResult,
} from '../types/oral';

// Common Singapore Chinese oral examination pronunciation and polyphone traps
export const COMMON_PRONUNCIATION_DATABASE: Array<{
  keyword: string;
  pinyin: string;
  mistake: string;
  explanation: string;
  toneInfo: string;
  category: 'polyphone' | 'tone_confusion' | 'singapore_accent' | 'difficult_character';
}> = [
  {
    keyword: '角色',
    pinyin: 'jué sè',
    mistake: 'jiǎo sè (角读三声)',
    explanation: '作“身份、戏剧人物”时读二声 jué，如“扮演重要角色”；只有作“牛角、角落”时才读 jiǎo。',
    toneInfo: '第二声 (阳平 /)',
    category: 'polyphone',
  },
  {
    keyword: '提供',
    pinyin: 'tí gōng',
    mistake: 'tí gòng (供读四声)',
    explanation: '“提供、供给、供求”中的“供”读第一声 gōng；作为名词“供品、口供”时才读 gòng。',
    toneInfo: '第一声 (阴平 —)',
    category: 'polyphone',
  },
  {
    keyword: '潜移默化',
    pinyin: 'qián yí mò huà',
    mistake: 'qiǎn yí mò huà (潜误读三声)',
    explanation: '“潜”读第二声 qián，不可受方言或习惯影响误读为第三声 qiǎn。',
    toneInfo: '第二声 (阳平 /)',
    category: 'tone_confusion',
  },
  {
    keyword: '塑料',
    pinyin: 'sù liào',
    mistake: 'suò liào / shù liào',
    explanation: '“塑”读平舌四声 sù，新加坡常见将“塑料袋”读为 suò 甚至 shù，需咬字清晰规范。',
    toneInfo: '第四声 (去声 \\)',
    category: 'singapore_accent',
  },
  {
    keyword: '垃圾',
    pinyin: 'lā jī',
    mistake: 'lè sè (台湾读法) 或 lǎ jī',
    explanation: '新加坡与中国国家规范读音为 lā jī（第一声），不可读为台湾音 lè sè。',
    toneInfo: '第一声 (阴平 —)',
    category: 'singapore_accent',
  },
  {
    keyword: '尽管',
    pinyin: 'jǐn guǎn',
    mistake: 'jìn guǎn (尽误读四声)',
    explanation: '作连词“尽管、尽量”时读第三声 jǐn；作“尽力、尽心”时才读第四声 jìn。',
    toneInfo: '第三声 (上声 v)',
    category: 'polyphone',
  },
  {
    keyword: '惩罚',
    pinyin: 'chéng fá',
    mistake: 'chěng fá (惩误读三声)',
    explanation: '“惩”读第二声 chéng，常被误读为三声 chěng。口试谈及法律或校规时高频出现。',
    toneInfo: '第二声 (阳平 /)',
    category: 'tone_confusion',
  },
  {
    keyword: '称职',
    pinyin: 'chèn zhí',
    mistake: 'chēng zhí (称误读一声)',
    explanation: '作“相称、称职、称心”时读去声 chèn；作“称呼、称赞”时读 chēng。',
    toneInfo: '第四声 (去声 \\)',
    category: 'polyphone',
  },
  {
    keyword: '莘莘学子',
    pinyin: 'shēn shēn xué zǐ',
    mistake: 'xīn xīn xué zǐ',
    explanation: '“莘”读一声 shēn，切勿望文生义读作 xīn。常用于谈及学校与青少年教育。',
    toneInfo: '第一声 (阴平 —)',
    category: 'difficult_character',
  },
  {
    keyword: '埋怨',
    pinyin: 'mán yuàn',
    mistake: 'mái yuàn',
    explanation: '表达心中的抱怨、不满时，“埋”读第二声 mán，不能读作 mái。',
    toneInfo: '第二声 (阳平 /)',
    category: 'polyphone',
  },
  {
    keyword: '给予',
    pinyin: 'jǐ yǔ',
    mistake: 'gěi yǔ',
    explanation: '书面表达及正式口试表达中，“给予”规范读音为 jǐ yǔ，非口语中的 gěi yǔ。',
    toneInfo: '第三声 (上声 v)',
    category: 'difficult_character',
  },
  {
    keyword: '勉强',
    pinyin: 'miǎn qiǎng',
    mistake: 'miǎn qiáng (强误读二声)',
    explanation: '“勉强、牵强”中的“强”读第三声 qiǎng；形容强大时才读 qiáng。',
    toneInfo: '第三声 (上声 v)',
    category: 'polyphone',
  },
];

// Discourse logic connectors used to evaluate expression logic
export const LOGICAL_CONNECTORS = {
  causal: ['因为', '之所以', '主要是由于', '其根本原因在于', '因此', '导致了'],
  transition: ['然而', '不过', '不可否认的是', '话虽如此', '相反地', '尽管如此'],
  progressive: ['不仅如此', '更重要的是', '再者', '与此同时', '进一步来说', '甚至'],
  multiAngle: ['从个人的角度来看', '从学校教育的层面', '从家庭环境来说', '从社会与政府的角度', '双管齐下', '三方合作'],
  conclusion: ['总的来说', '综上所述', '我认为唯有', '方能构建', '长远来看'],
};

// Evaluate text to detect pronunciation issues based on keyword match
export function detectPronunciationIssues(text: string): PronunciationIssue[] {
  const issues: PronunciationIssue[] = [];
  for (const item of COMMON_PRONUNCIATION_DATABASE) {
    if (text.includes(item.keyword)) {
      issues.push({
        word: item.keyword,
        pinyin: item.pinyin,
        studentMistake: item.mistake,
        explanation: item.explanation,
        toneInfo: item.toneInfo,
        category: item.category,
      });
    }
  }
  return issues;
}

// Logic gap and depth inspection
export interface ContentLogicAnalysis {
  wordCount: number;
  hasPersonalExample: boolean;
  hasMultiAngle: boolean;
  connectorsFound: string[];
  depthScore: number; // 0 - 15
  expressionScore: number; // 0 - 15
  vocabularyScore: number; // 0 - 10
  pronunciationScore: number; // 0 - 10
  totalScore: number; // 0 - 50
}

export function analyzeOralTranscript(text: string): ContentLogicAnalysis {
  const cleaned = text.trim();
  const wordCount = cleaned.replace(/\s+/g, '').length;

  // Check personal example
  const personalKeywords = ['我记得', '在我的日常生活', '有一次', '我的学校', '我和家人', '我亲身经历', '据我观察', '我曾经'];
  const hasPersonalExample = personalKeywords.some(kw => cleaned.includes(kw));

  // Check multi-angle analysis
  const angleKeywords = ['政府', '学校', '家庭', '家长', '社会', '公民', '民众', '媒体', '法律', '惩罚', '教育', '引导'];
  const matchedAngles = angleKeywords.filter(kw => cleaned.includes(kw));
  const hasMultiAngle = matchedAngles.length >= 2;

  // Check connectors
  const allConnectors = [
    ...LOGICAL_CONNECTORS.causal,
    ...LOGICAL_CONNECTORS.transition,
    ...LOGICAL_CONNECTORS.progressive,
    ...LOGICAL_CONNECTORS.multiAngle,
    ...LOGICAL_CONNECTORS.conclusion,
  ];
  const connectorsFound = allConnectors.filter(c => cleaned.includes(c));

  // Base scores
  let depthScore = 7;
  let expressionScore = 7;
  let vocabularyScore = 5;
  let pronunciationScore = 7;

  // Length factor
  if (wordCount >= 200) {
    depthScore += 3;
    expressionScore += 3;
  } else if (wordCount >= 100) {
    depthScore += 2;
    expressionScore += 2;
  } else if (wordCount < 40) {
    depthScore = Math.max(3, depthScore - 3);
    expressionScore = Math.max(3, expressionScore - 3);
  }

  // Personal example factor
  if (hasPersonalExample) {
    depthScore = Math.min(15, depthScore + 2);
  }

  // Multi-angle factor
  if (hasMultiAngle) {
    depthScore = Math.min(15, depthScore + 2);
    expressionScore = Math.min(15, expressionScore + 1);
  }

  // Connectors factor
  if (connectorsFound.length >= 4) {
    expressionScore = Math.min(15, expressionScore + 2);
    vocabularyScore = Math.min(10, vocabularyScore + 2);
  } else if (connectorsFound.length >= 2) {
    expressionScore = Math.min(15, expressionScore + 1);
  }

  // Vocabulary richness (idioms and 4-character idioms check)
  const idiomRegex = /[\u4e00-\u9fa5]{4}/g;
  const matches = cleaned.match(idiomRegex) || [];
  if (matches.length >= 2) {
    vocabularyScore = Math.min(10, vocabularyScore + 2);
  }

  const totalScore = Math.min(50, depthScore + expressionScore + vocabularyScore + pronunciationScore);

  return {
    wordCount,
    hasPersonalExample,
    hasMultiAngle,
    connectorsFound,
    depthScore,
    expressionScore,
    vocabularyScore,
    pronunciationScore,
    totalScore,
  };
}

export function determineBand(totalScore: number): EvaluationResult['band'] {
  if (totalScore >= 42) return 'Band 1 (极佳 42-50)';
  if (totalScore >= 34) return 'Band 2 (优良 34-41)';
  if (totalScore >= 25) return 'Band 3 (尚可 25-33)';
  return 'Band 4 (待努力 0-24)';
}

// Generate the 3 requested core feedback items:
// 1. 哪里表达清楚
// 2. 哪里缺少理由
// 3. 下一次怎么改
export function generateTripleFeedback(
  transcript: string,
  analysis: ContentLogicAnalysis,
  topicTitle: string
): CoreTripleFeedback {
  const highlights: string[] = [];
  const goodPhrases: string[] = [];
  const gaps: string[] = [];
  const suggestedAngles: string[] = [];
  const actionableSteps: string[] = [];

  // 1. 哪里表达清楚
  if (analysis.connectorsFound.length > 0) {
    highlights.push(`合理使用了逻辑衔接词（如“${analysis.connectorsFound.slice(0, 3).join('”、“')}”），语段过渡较为自然。`);
    goodPhrases.push(...analysis.connectorsFound.slice(0, 3));
  } else {
    highlights.push('基本陈述了自己的立场与基本看法，能扣紧短片中的主要生活场景进行回应。');
  }

  if (analysis.hasPersonalExample) {
    highlights.push('融入了生活经验与个人见闻，使答题具有真实感，不再只是空泛说道理。');
  }

  if (analysis.wordCount >= 120) {
    highlights.push('表达篇幅充实，能围绕主题展开多层陈述，展现了良好的语流持续能力。');
  }

  // 2. 哪里缺少理由 (Missing Rationale / Logical Gaps)
  if (!analysis.hasPersonalExample) {
    gaps.push('缺少具象化的“个人见闻或校园亲身经历”：考官看重考生是否有生活感触，光说“大家应该这样做”显得缺乏说服力。');
    suggestedAngles.push('加入微场景描述：例如“在我的邻里组屋楼下/学校食堂，我也曾目睹过……”');
  }

  if (!analysis.hasMultiAngle) {
    gaps.push('论述视角略显单一，主要停留在批评或单一呼吁层面，缺乏“多方协同”的深度剖析。');
    suggestedAngles.push('构建“家庭-学校-社会与政府”三维论证网，分析为什么单靠自律不够、为什么需要制度与教育双管齐下。');
  }

  if (analysis.connectorsFound.length < 2) {
    gaps.push('因果链条不够紧密：提出建议后，未进一步解释“为什么这个方法有效”（缺少“之所以……是因为……”的递进阐述）。');
    suggestedAngles.push('每一条建议后必须补充一句“这样不仅能……而且可以从根本上……”。');
  }

  // 3. 下一次怎么改 (Actionable Next Steps & ORID Framework)
  actionableSteps.push('应用新加坡口试“总-分-总”或“ORID”结构答题，开头明确表明态度，中间分层论述，结尾总结升华。');
  actionableSteps.push('强化新加坡本地现实生活关联度，适当提及我国的公共设施或政策（如淡滨尼生态市镇、小贩中心托盘归还律例、ActiveSG等）。');
  actionableSteps.push('注意规范华语与普通话四声调值，避免把“角色”读成 jiǎo sè，把“塑料”读成 suò liào。');

  return {
    clearExpression: {
      summary: `答题条理较为清晰，抓住了短片关于《${topicTitle}》的核心要素，能主动提出观点。`,
      highlights: highlights.length > 0 ? highlights : ['能针对短片内容做出回应，态度认真诚恳。'],
      goodPhrasesUsed: goodPhrases.length > 0 ? goodPhrases : ['我认为', '总的来说'],
    },
    missingReasons: {
      summary: '部分论点的论据支撑稍显单薄，缺少由浅入深的成因分析与多角度立体论证。',
      gaps: gaps.length > 0 ? gaps : ['可以进一步深化为什么会产生这种现象的根本心理成因。'],
      suggestedAngles: suggestedAngles.length > 0 ? suggestedAngles : ['从民众意识提升与长期教育养成双向阐述。'],
    },
    nextTimeImprovements: {
      summary: '下一次练习时，请牢记“论点+具体例证+深层原因+多元建议”的高分公式。',
      actionableSteps,
      modelSentenceStarter: [
        '“看了这个短片，我深有感触。我认为……”（点题表态）',
        '“之所以会出现这种情况，其根本原因在于……”（剖析原因）',
        '“以我身边的经历为例，有一次……”（个人见闻论据）',
        '“若要从长远改善，我认为家庭、学校与社会必须多管齐下……”（立体建议）',
      ],
      oridFrameworkExample: {
        objective: '短片中显示有部分食客用餐后直接离去，未清理桌面。',
        reflective: '看到这一幕我感到十分惋惜，因为保持小贩中心清洁不仅关乎公德心，也是体谅年迈清洁工的体现。',
        interpretive: '究其原因，一方面是部分人抱有“反正有人收拾”的侥幸与懒惰心态，另一方面是同理心教育尚未内化。',
        decisional: '因此，除了严格执行归还法规外，学校应从小培养学生的自理意识，家庭也需言传身教，共同维护清洁绿雅的家园。',
      },
    },
  };
}

// Compare before and after attempts
export function compareAttempts(
  round1: EvaluationResult,
  round2: EvaluationResult
): ComparisonResult {
  const scoreDiff = round2.totalScore - round1.totalScore;
  const contentGains: string[] = [];
  const logicImprovements: string[] = [];
  const vocabularyUpgrades: string[] = [];
  const pronunciationFixes: string[] = [];

  // Content gains
  if (round2.rubric.content.score > round1.rubric.content.score) {
    contentGains.push(`思想内容从 ${round1.rubric.content.score}分 提升至 ${round2.rubric.content.score}分，论点明显更充实。`);
  }
  if (round2.initialTranscript.length > round1.initialTranscript.length + 30) {
    contentGains.push(`答题篇幅与信息量显著增长，从前次的约 ${round1.initialTranscript.length}字 扩充至 ${round2.initialTranscript.length}字。`);
  } else {
    contentGains.push('回答更加凝练聚焦，废话减少，直击考官关注的核心议题。');
  }

  // Logic improvements
  if (round2.rubric.expression.score > round1.rubric.expression.score) {
    logicImprovements.push('逻辑衔接词使用更地道，因果与递进层次井然有序。');
  } else {
    logicImprovements.push('语流更加连贯自信，停顿卡顿明显减少。');
  }

  // Vocabulary
  if (round2.rubric.vocabulary.score > round1.rubric.vocabulary.score) {
    vocabularyUpgrades.push('高分语料库词汇和四字成语使用率明显提高。');
  } else {
    vocabularyUpgrades.push('用词更为规范地道，减少了口头随意的用语。');
  }

  // Pronunciation
  const r1Issues = round1.pronunciationIssues.map(p => p.word);
  const r2Issues = round2.pronunciationIssues.map(p => p.word);
  const fixed = r1Issues.filter(w => !r2Issues.includes(w));
  if (fixed.length > 0) {
    pronunciationFixes.push(`成功纠正了易错词汇：${fixed.join('、')}，声调咬字更为标准。`);
  } else {
    pronunciationFixes.push('整体语音语调平稳自然，普通话声调控制更扎实。');
  }

  let examinerVerdict = '';
  if (scoreDiff >= 5) {
    examinerVerdict = `显著飞跃！二次练习比前一次提升了 ${scoreDiff} 分。成功弥补了理由单薄的弱点，论据充实，展现了极强的应考反思与进步能力！`;
  } else if (scoreDiff > 0) {
    examinerVerdict = `稳步提升！二次练习比前一次提高了 ${scoreDiff} 分。表达结构更为严密，建议继续保持在深层原因剖析上的发掘。`;
  } else {
    examinerVerdict = '发挥稳定。两次练习各有亮点，建议下一次多运用“ORID”焦点讨论法，让见解更加独到深刻。';
  }

  return {
    round1,
    round2,
    scoreDifference: scoreDiff,
    contentGains,
    logicImprovements,
    vocabularyUpgrades,
    pronunciationFixes,
    examinerVerdict,
  };
}
