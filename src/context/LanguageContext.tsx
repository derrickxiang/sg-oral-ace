import React, { createContext, useContext, useState } from 'react';
import { OralTopic } from '../types/oral';

export type Language = 'en' | 'zh';

interface TopicTranslation {
  titleEn: string;
  themeEn: string;
  videoTitleEn: string;
  backgroundContextEn: string;
  primaryQuestionEnHint: string;
}

export const TOPIC_EN_TRANSLATIONS: Record<string, TopicTranslation> = {
  'topic-hawker-tray': {
    titleEn: 'Returning Trays & Cleaning Tables at Hawker Centres',
    themeEn: 'Civic Mindedness & Gracious Community',
    videoTitleEn: 'Gracious Singapore: Starting from Hawker Centre Tables',
    backgroundContextEn:
      'Singapore Hawker Culture is inscribed on the UNESCO Representative List of Intangible Cultural Heritage. Since 2021, NEA has enforced mandatory tray and crockery return. Examiners look for multi-angle thinking across civic consciousness, empathy for elderly cleaners, law vs habit, and family/school education.',
    primaryQuestionEnHint:
      'After watching this video, share your thoughts on diners returning trays and clearing tables at hawker centres.',
  },
  'topic-green-campus': {
    titleEn: 'Green Singapore: BYO Containers on Campus & Community',
    themeEn: 'Environmental Protection & Sustainability',
    videoTitleEn: 'Reducing Disposables: Bringing Reusable Containers',
    backgroundContextEn:
      'Under the Singapore Green Plan 2030 and Zero Waste Masterplan, reducing single-use plastics and extending Semakau Landfill’s lifespan are key priorities. Students should discuss convenience vs environmental duty, incentives, and cultivating green habits.',
    primaryQuestionEnHint:
      'After watching this video, what are your views on encouraging students and residents to bring their own reusable containers?',
  },
  'topic-scam-prevention': {
    titleEn: 'Digital Age: Youth & Community Anti-Scam Vigilance',
    themeEn: 'Digital Literacy & Social Safety',
    videoTitleEn: 'Staying Vigilant Against Online & Telecom Scams',
    backgroundContextEn:
      'With rising phishing and impersonation scams in Singapore, authorities promote the ScamShield app and the "ACT" (Add, Check, Tell) framework. Examiners assess how youth can protect themselves and help vulnerable seniors spot digital traps.',
    primaryQuestionEnHint:
      'After watching this video, share your views on how youths and the community can better guard against online scams.',
  },
  'topic-youth-volunteer': {
    titleEn: 'Caring for Seniors: Youth Volunteers Befriending Elderly',
    themeEn: 'Filial Piety & Intergenerational Bonding',
    videoTitleEn: 'Warming Hearts: Youth Volunteers in Rental Flats',
    backgroundContextEn:
      'As Singapore faces an ageing population, engaging youth through Values in Action (VIA) to care for seniors living alone builds an inclusive, compassionate society. Consider moving beyond one-off visits to genuine, sustained companionship.',
    primaryQuestionEnHint:
      'After watching this video, what do you think about encouraging secondary students to participate in elderly befriending volunteer work?',
  },
  'topic-social-media': {
    titleEn: 'Smart Living: Balancing Social Media & Mental Wellness',
    themeEn: 'Youth Growth & Self-Discipline',
    videoTitleEn: 'Putting Down Phones: Reclaiming Real-Life Connections',
    backgroundContextEn:
      'Excessive screen time and social media anxiety affect students’ sleep, studies, and face-to-face family communication. Examiners look for balanced perspectives on digital tools, self-discipline, and healthy offline hobbies.',
    primaryQuestionEnHint:
      'After watching this video, share your thoughts on how secondary school students can use social media wisely.',
  },
  'topic-ai-learning': {
    titleEn: 'Smart Classroom: AI-Assisted Learning & Critical Thinking',
    themeEn: 'Tech Ethics & Lifelong Learning',
    videoTitleEn: 'The Smart Era: When AI Enters Singapore Classrooms',
    backgroundContextEn:
      'Under MOE’s EdTech Masterplan 2030, Personal Learning Devices (PLDs) and AI tools empower self-directed learning, while teachers emphasize critical thinking, originality, and avoiding over-reliance on automated answers.',
    primaryQuestionEnHint:
      'After watching this video, share your thoughts on how secondary students should use AI and digital tools in their learning.',
  },
  'topic-hdb-neighbour': {
    titleEn: 'Kampung Spirit: HDB Neighbourliness & Mutual Consideration',
    themeEn: 'Community Cohesion & Inclusivity',
    videoTitleEn: 'Good Neighbours: Rekindling Warmth Along HDB Corridors',
    backgroundContextEn:
      'Over 80% of Singaporeans live in HDB flats. The Good Neighbours Movement promotes modern Kampung Spirit, multiracial harmony, and resolving high-density living friction (like noise or corridor clutter) through empathy.',
    primaryQuestionEnHint:
      'After watching this video, how can we foster harmonious neighbourly relations in Singapore’s HDB communities today?',
  },
  'topic-cultural-heritage': {
    titleEn: 'Passing the Torch: Youth & Traditional Cultural Heritage',
    themeEn: 'Cultural Identity & Innovation',
    videoTitleEn: 'Lights of Chinatown: Revitalising Heritage Among Youth',
    backgroundContextEn:
      'Through Mother Tongue Languages (MTL) Fortnight and the Singapore Chinese Cultural Centre (SCCC), Singapore encourages youths to connect with their cultural roots via hands-on crafts and creative modern media.',
    primaryQuestionEnHint:
      'After watching this video, how do you think we can attract more young Singaporeans to appreciate and pass down traditional culture?',
  },
  'topic-campus-wellbeing': {
    titleEn: 'Growing Strong: Academic Resilience & Peer Support',
    themeEn: 'Mental Wellness & Peer Care',
    videoTitleEn: 'Listening & Companionship: Warmth by the School Track',
    backgroundContextEn:
      'MOE’s Peer Support Structures train students to Look Out For, Listen, and Link peers facing exam stress or emotional lows, while promoting healthy work-life balance, sports, and resilience.',
    primaryQuestionEnHint:
      'After watching this video, how should secondary students cope with stress, and how can classmates support one another?',
  },
  'topic-cashless-seniors': {
    titleEn: 'Smart Nation: Cashless Payments & Senior Digital Inclusion',
    themeEn: 'Digital Inclusion & Empathy',
    videoTitleEn: 'Behind the QR Code: Leaving No Senior Behind',
    backgroundContextEn:
      'As PayNow and SGQR become ubiquitous across hawker centres and wet markets, SG Digital Office ambassadors and youth volunteers play a vital role in helping seniors bridge the digital divide patiently.',
    primaryQuestionEnHint:
      'After watching this video, how can we help seniors bridge the digital divide as Singapore advances towards a cashless society?',
  },
  'topic-racial-harmony': {
    titleEn: 'Multicultural Harmony: Racial Harmony Day & Everyday Inclusivity',
    themeEn: 'National Identity & Racial Cohesion',
    videoTitleEn: 'Vibrant Singapore: From Ethnic Attire to True Empathy',
    backgroundContextEn:
      'Commemorated every 21 July, Racial Harmony Day reminds Singaporeans never to take social cohesion for granted. Examiners look for reflections beyond dressing up—such as respecting Halal/dietary practices, building friendships across CCA groups, and practising mutual respect daily.',
    primaryQuestionEnHint:
      'After watching this video, how can youths further strengthen racial and religious harmony in their everyday lives in Singapore?',
  },
  'topic-hawker-heritage': {
    titleEn: 'UNESCO Heritage: Young Hawkerpreneurs & Culinary Succession',
    themeEn: 'Intangible Heritage & Work Ethic',
    videoTitleEn: 'A Bowl of Fishball Noodles: Two Generations of Hawker Pride',
    backgroundContextEn:
      'While Singapore Hawker Culture is a UNESCO Intangible Cultural Heritage, ageing master hawkers face succession challenges. NEA’s Hawker Development Programme supports young hawkerpreneurs who blend traditional craftsmanship with modern kitchen tech.',
    primaryQuestionEnHint:
      'After watching this video, what are your views on young Singaporeans joining the hawker trade to preserve our culinary heritage?',
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (en: string, zh: string) => string;
  getTopicDisplay: (topic: OralTopic) => {
    title: string;
    theme: string;
    videoTitle: string;
    backgroundContext: string;
    primaryQuestionEnHint?: string;
  };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to English ('en') as requested by user
  const [lang, setLang] = useState<Language>('en');

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'zh' : 'en'));
  };

  const t = (en: string, zh: string) => (lang === 'en' ? en : zh);

  const getTopicDisplay = (topic: OralTopic) => {
    const tr = TOPIC_EN_TRANSLATIONS[topic.id];
    if (lang === 'en' && tr) {
      return {
        title: tr.titleEn,
        theme: tr.themeEn,
        videoTitle: `${tr.videoTitleEn} (${topic.videoTitle})`,
        backgroundContext: tr.backgroundContextEn,
        primaryQuestionEnHint: tr.primaryQuestionEnHint,
      };
    }
    return {
      title: topic.title,
      theme: topic.theme,
      videoTitle: topic.videoTitle,
      backgroundContext: topic.backgroundContext,
      primaryQuestionEnHint: undefined,
    };
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, getTopicDisplay }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
