export interface VideoScene {
  id: string;
  timestamp: string; // e.g. "0:05 - 0:15"
  title: string;
  description: string;
  dialogue?: string;
  imagePromptDescription: string;
  bgGradient: string;
  iconName: string;
}

export interface OralTopic {
  id: string;
  title: string;
  theme: string; // e.g. "社会公德与社区生活"
  level: "Express" | "Normal Academic" | "O-Level Higher Chinese";
  duration: number; // in seconds, usually 60s for video
  videoThumbnail: string;
  videoTitle: string;
  videoDescription: string;
  scenes: VideoScene[];
  primaryQuestion: string; // e.g. "看了这个录像，谈谈你的看法？"
  examinerGreeting: string;
  backgroundContext: string;
  suggestedPoints: string[];
  suggestedVocabulary: {
    word: string;
    pinyin: string;
    meaning: string;
    sampleSentence: string;
  }[];
  commonPronunciationTraps: {
    word: string;
    pinyin: string;
    commonError: string;
    tip: string;
  }[];
  modelAnswer: {
    structure: string; // ORID or 总-分-总
    content: string;
    highlights: string[];
  };
  similarTopicId?: string; // For "同类题再练一次"
}

export interface PronunciationIssue {
  word: string;
  pinyin: string;
  studentMistake?: string;
  explanation: string;
  toneInfo: string; // e.g. "第二声 (阳平 /)"
  category: "polyphone" | "tone_confusion" | "singapore_accent" | "difficult_character";
}

export interface RubricDimension {
  name: string;
  score: number; // e.g. 1-5 or 1-10
  maxScore: number;
  level: "极佳 (Band 1)" | "优良 (Band 2)" | "尚可 (Band 3)" | "待加强 (Band 4)";
  feedback: string;
  keyObservations: string[];
}

export interface CoreTripleFeedback {
  // 1. 哪里表达清楚
  clearExpression: {
    summary: string;
    highlights: string[];
    goodPhrasesUsed: string[];
  };
  // 2. 哪里缺少理由
  missingReasons: {
    summary: string;
    gaps: string[];
    suggestedAngles: string[]; // e.g. "可以从学校教育、家庭熏陶、政府法律三方面切入"
  };
  // 3. 下一次怎么改
  nextTimeImprovements: {
    summary: string;
    actionableSteps: string[];
    modelSentenceStarter: string[];
    oridFrameworkExample: {
      objective: string; // 见闻 (看到什么)
      reflective: string; // 感受 (有何触动)
      interpretive: string; // 分析 (原因何在)
      decisional: string; // 建议/行动 (未来如何做)
    };
  };
}

export interface CorpusSuggestion {
  connectives: {
    type: "递进" | "转折" | "因果" | "总结";
    words: string[];
    example: string;
  }[];
  idiomsAndProverbs: {
    phrase: string;
    meaning: string;
    usageContext: string;
  }[];
  singaporeTerms: {
    term: string;
    properUsage: string;
  }[];
}

export interface EvaluationResult {
  id: string;
  topicId: string;
  topicTitle: string;
  createdAt: string;
  totalScore: number; // 0 - 50
  band: "Band 1 (极佳 42-50)" | "Band 2 (优良 34-41)" | "Band 3 (尚可 25-33)" | "Band 4 (待努力 0-24)";
  rubric: {
    content: RubricDimension; // 思想内容 (15分)
    expression: RubricDimension; // 表达与结构 (15分)
    vocabulary: RubricDimension; // 词汇与语料 (10分)
    pronunciation: RubricDimension; // 语音与发音 (10分)
  };
  tripleFeedback: CoreTripleFeedback;
  pronunciationIssues: PronunciationIssue[];
  corpusSuggestions: CorpusSuggestion;
  initialTranscript: string;
  followUpQuestion?: string;
  followUpTranscript?: string;
  audioDurationSeconds: number;
  isRetest?: boolean;
  aiMetadata?: {
    engine: string;
    model?: string;
    analysisFocus?: string;
  };
}

export interface ComparisonResult {
  round1: EvaluationResult;
  round2: EvaluationResult;
  scoreDifference: number; // e.g. +6
  contentGains: string[];
  logicImprovements: string[];
  vocabularyUpgrades: string[];
  pronunciationFixes: string[];
  examinerVerdict: string;
}

export interface WeeklyProgressRecord {
  weekId: string; // e.g. "2026-W45"
  date: string;
  practicesCount: number;
  averageScore: number;
  retestCount: number;
  pronunciationErrorsFixedCount: number;
  vocabularyMasteredCount: number;
  history: EvaluationResult[];
}
