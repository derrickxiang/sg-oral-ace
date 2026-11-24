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
  'topic-public-transport-seat': {
    titleEn: 'Priority Seats & Courtesy on Public Transport',
    themeEn: 'Empathy & Gracious Commuting',
    videoTitleEn: 'Empathy on the MRT: Warmth of Priority Seats',
    backgroundContextEn:
      'LTA’s Caring SG Commuters movement encourages commuters to give up seats to seniors, expectant mothers, and commuters with invisible medical needs—without harsh online shaming.',
    primaryQuestionEnHint:
      'After watching this video, share your thoughts on giving up seats and showing consideration on public transport.',
  },
  'topic-part-time-work': {
    titleEn: 'Gains & Trade-Offs of Student Part-Time Work',
    themeEn: 'Youth Growth & Responsibility',
    videoTitleEn: 'Working During School Holidays: Experience vs Balance',
    backgroundContextEn:
      'Holiday jobs teach secondary and pre-U teens financial independence, customer communication, and gratitude for parents’ hard work, provided study hours and rest are not compromised.',
    primaryQuestionEnHint:
      'What are your views on secondary school students taking up part-time jobs during school holidays or weekends?',
  },
  'topic-active-youth-health': {
    titleEn: 'Active Living: Youth Sports & Healthy Routines',
    themeEn: 'Physical Wellness & Self-Discipline',
    videoTitleEn: 'Active Singapore: Stepping Out to Park Connectors',
    backgroundContextEn:
      'With ActiveSG facilities and Park Connector Networks (PCN), teens can counter sedentary screen habits through regular sports, stress relief, and lasting fitness routines.',
    primaryQuestionEnHint:
      'What are your thoughts on how youths can cultivate regular exercise habits and maintain an active lifestyle?',
  },
  'topic-food-waste-reduction': {
    titleEn: 'Cherishing Food & Reducing Food Waste',
    themeEn: 'Thrift & Sustainable Living',
    videoTitleEn: 'Every Grain Counts: Action Against Food Waste',
    backgroundContextEn:
      'Singapore imports over 90% of its food, and food waste is one of the largest waste streams. Ordering right portions, bringing containers for leftovers, and food rescue programmes help protect food security.',
    primaryQuestionEnHint:
      'What are your views on reducing food waste and cultivating mindful eating habits in Singapore?',
  },
  'topic-tuition-stress': {
    titleEn: 'Tuition Culture & Managing Academic Stress',
    themeEn: 'Holistic Development & Study Balance',
    videoTitleEn: 'Beyond Grades: Finding Your Own Learning Pace',
    backgroundContextEn:
      'MOE’s "Learn for Life" reforms reduce over-emphasis on exam rankings and promote holistic growth. Students and parents benefit from targeted revision rather than piling on excessive tuition.',
    primaryQuestionEnHint:
      'What are your thoughts on students attending extra tuition classes and coping with academic stress?',
  },
  'topic-phubbing-communication': {
    titleEn: 'Putting Phones Down for Meaningful Family Conversations',
    themeEn: 'Technology & Interpersonal Bonds',
    videoTitleEn: 'Look Up at the Dining Table: Beyond Phubbing',
    backgroundContextEn:
      'Family meals are a vital anchor for intergenerational communication in Singapore. Setting phone-free dining agreements restores eye contact, empathy, and genuine warmth.',
    primaryQuestionEnHint:
      'What are your views on people staying glued to their phones during family meals or gatherings with friends?',
  },
  'topic-youth-financial-literacy': {
    titleEn: 'Youth Financial Literacy & Smart Spending',
    themeEn: 'Self-Management & Values',
    videoTitleEn: 'Allowance Wisdom: Separating Needs from Wants',
    backgroundContextEn:
      'Facing e-commerce discounts and blind-box trends, students learn budgeting, distinguishing needs from wants, and disciplined saving for meaningful goals.',
    primaryQuestionEnHint:
      'What are your thoughts on youths learning financial literacy and managing their pocket money wisely?',
  },
  'topic-reading-lifelong-learning': {
    titleEn: 'Deep Reading Habits & Lifelong Learning',
    themeEn: 'Self-Improvement & Curiosity',
    videoTitleEn: 'Book-Loving Singapore: Guarding Deep Reading',
    backgroundContextEn:
      'NLB’s National Reading Movement encourages reading 15 minutes daily to counter short-video distraction, strengthen vocabulary, and nurture lifelong learning.',
    primaryQuestionEnHint:
      'What are your views on cultivating deep reading habits and embracing lifelong learning today?',
  },
  'topic-civic-queue-courtesy': {
    titleEn: 'Orderly Queuing & Letting Passengers Alight First',
    themeEn: 'Civic Mindedness & Public Etiquette',
    videoTitleEn: 'One Step Back: Order at Busy Stations',
    backgroundContextEn:
      'In high-density MRT stations and bus interchanges, letting passengers alight before boarding improves safety and overall boarding speed for everyone.',
    primaryQuestionEnHint:
      'After watching this clip, share your views on queuing politely and letting passengers exit first in public spaces.',
  },
  'topic-civic-shared-bicycle': {
    titleEn: 'Responsible Parking of Shared Bicycles',
    themeEn: 'Civic Responsibility & Shared Spaces',
    videoTitleEn: 'The Last Mile: Where Should Shared Bikes Go?',
    backgroundContextEn:
      'Singapore promotes Car-Lite commuting via cycling paths and designated yellow QR parking zones. Reckless parking blocks tactile paving and wheelchair ramps.',
    primaryQuestionEnHint:
      'After watching this clip, what are your thoughts on our shared responsibility when using public or shared bicycles?',
  },
  'topic-civic-community-fridge': {
    titleEn: 'Community Fridges & Neighbourhood Care',
    themeEn: 'Community Care & Food Sharing',
    videoTitleEn: 'A Small Fridge Under the HDB Block Full of Kindness',
    backgroundContextEn:
      'Residents’ Networks and youth volunteers maintain HDB void-deck community fridges, turning surplus groceries into dignified help for seniors and needy households.',
    primaryQuestionEnHint:
      'After watching this clip, share your views on neighbourhood mutual-aid projects such as community fridges.',
  },
  'topic-civic-pet-responsibility': {
    titleEn: 'Responsible Pet Ownership in HDB Estates',
    themeEn: 'Neighbourhood Harmony & Responsibility',
    videoTitleEn: 'Hold the Leash: Being a Considerate Pet Owner',
    backgroundContextEn:
      'In dense multiracial HDB estates, keeping pets leashed, cleaning up waste, and asking neighbours politely in lifts ensure comfort and respect for everyone.',
    primaryQuestionEnHint:
      'After watching this clip, what are your thoughts on responsible pet ownership in Singapore’s HDB neighbourhoods?',
  },
  'topic-green-water-conservation': {
    titleEn: 'Cherishing Every Drop: Everyday Water Conservation',
    themeEn: 'Resource Sustainability & Gratitude',
    videoTitleEn: 'Where Our Water Comes From: Every Drop Counts',
    backgroundContextEn:
      'Singapore relies on Four National Taps—including NEWater and desalinated water. Daily habits like shorter showers and reusing vegetable-wash water build water resilience.',
    primaryQuestionEnHint:
      'After watching this clip, how can youths cultivate practical water-saving habits in daily life?',
  },
  'topic-green-ewaste-recycling': {
    titleEn: 'E-Waste Recycling & Circular Electronics Habits',
    themeEn: 'Circular Economy & Safety',
    videoTitleEn: 'New Life for Old Phones: Keep E-Waste Out of Regular Bins',
    backgroundContextEn:
      'Discarding lithium batteries in normal chutes risks fires and toxic leakage. Singapore’s Extended Producer Responsibility framework provides convenient community e-waste bins.',
    primaryQuestionEnHint:
      'After watching this clip, share your views on how youths can reduce and properly recycle electronic waste.',
  },
  'topic-green-sleep-wellness': {
    titleEn: 'Healthy Sleep Routines & Avoiding Late-Night Scrolling',
    themeEn: 'Health & Self-Regulation',
    videoTitleEn: 'Midnight Glow: Put the Phone Away for Restful Sleep',
    backgroundContextEn:
      'Late-night scrolling cuts into sleep before early school mornings, harming focus and mood. Keeping phones outside the bedroom and planning daytime study improves rest.',
    primaryQuestionEnHint:
      'After watching this clip, what are your views on secondary students keeping regular sleep schedules?',
  },
  'topic-green-urban-farming': {
    titleEn: 'HDB Rooftop Gardens & Urban Farming',
    themeEn: 'Green Cities & Community Bonding',
    videoTitleEn: 'Greenery Above the Flats: Community Farming Moments',
    backgroundContextEn:
      'Aligned with Singapore’s 30-by-30 food vision and Community in Bloom gardens, HDB rooftop farms teach students where food comes from while uniting neighbours across generations.',
    primaryQuestionEnHint:
      'After watching this clip, what do you think about promoting community gardens and urban farming in HDB estates?',
  },
  'topic-green-sugar-health': {
    titleEn: 'Cutting Sugary Drinks & Smart Nutrition Choices',
    themeEn: 'Healthy Diet & Moderation',
    videoTitleEn: 'Reading Nutri-Grade Labels: Less Sugar, More Energy',
    backgroundContextEn:
      'Under Singapore’s Nutri-Grade labelling (A–D) and "Siu Dai" coffee-shop culture, teens learn to read sugar labels and choose lower-sugar drinks or plain water.',
    primaryQuestionEnHint:
      'After watching this clip, share your views on encouraging youths to cut back on sugary drinks and eat healthily.',
  },
  'topic-tech-cyberbullying': {
    titleEn: 'Standing Up Against Cyberbullying & Kind Online Spaces',
    themeEn: 'Digital Citizenship & Empathy',
    videoTitleEn: 'Weight Behind the Keyboard: Words Heal or Hurt',
    backgroundContextEn:
      'Anonymous posts spread quickly and leave lasting emotional harm. Being an active upstander, saving screenshots, and seeking help from counsellors protect classmates.',
    primaryQuestionEnHint:
      'After watching this clip, what are your thoughts on the harm of cyberbullying and building kinder online spaces?',
  },
  'topic-tech-fake-news': {
    titleEn: 'Spotting Fake News & Verifying Before Sharing',
    themeEn: 'Media Literacy & Critical Thinking',
    videoTitleEn: 'Think Before You Forward: Verify Viral Messages',
    backgroundContextEn:
      'Using the S.U.R.E. framework (Source, Understand, Research, Evaluate), youths can pause before forwarding sensational rumours and gently help seniors check official sources.',
    primaryQuestionEnHint:
      'After watching this clip, why does misinformation spread online, and how should families respond?',
  },
  'topic-tech-digital-privacy': {
    titleEn: 'Protecting Personal Data & Managing Digital Footprints',
    themeEn: 'Cyber Safety & Self-Protection',
    videoTitleEn: 'Online Footprints: Guarding Your Personal Information',
    backgroundContextEn:
      'Posting school crests, home numbers, or boarding passes exposes personal details permanently. Enabling 2FA, private accounts, and cautious app permissions keeps students safe.',
    primaryQuestionEnHint:
      'After watching this clip, share your views on protecting personal privacy and being careful with online sharing.',
  },
  'topic-culture-dialect-roots': {
    titleEn: 'Warmth of Heritage Dialects & Intergenerational Bonding',
    themeEn: 'Family Ties & Cultural Roots',
    videoTitleEn: 'Speaking Ah Ma’s Words: Bridging Generations',
    backgroundContextEn:
      'Even learning a few warm dialect greetings—such as asking grandparents if they have eaten—deeply touches older generations and preserves family heritage stories.',
    primaryQuestionEnHint:
      'After watching this clip, what are your views on younger generations learning a little dialect to connect with grandparents?',
  },
  'topic-culture-festive-greetings': {
    titleEn: 'Preserving Festive Warmth with Modern Creativity',
    themeEn: 'Traditional Festivals & Family Gatherings',
    videoTitleEn: 'More Than Copy-Paste Wishes: Keeping Festivals Meaningful',
    backgroundContextEn:
      'While digital e-Hongbaos save paper, mass copy-pasted greetings feel impersonal. Hands-on lantern making, reunion dinners, and visiting elders keep cultural warmth alive.',
    primaryQuestionEnHint:
      'After watching this clip, how can youths keep the spirit and warmth of traditional festivals alive today?',
  },
  'topic-culture-mother-tongue-use': {
    titleEn: 'Speaking Mandarin Confidently in Everyday Life',
    themeEn: 'Bilingual Confidence & Heritage',
    videoTitleEn: 'Speak Up Boldly: Starting from Ordering Hawker Food',
    backgroundContextEn:
      'Many youths avoid speaking Mandarin for fear of imperfect tones. Practising warmly at hawker stalls, at home, and with peers turns bilingualism into a lifelong strength.',
    primaryQuestionEnHint:
      'After watching this clip, how can young people overcome shyness and speak Mandarin more regularly in daily life?',
  },
  'topic-culture-kopitiam-heritage': {
    titleEn: 'Traditional Nanyang Kopitiam Culture & Community Spaces',
    themeEn: 'Local Food Culture & Social Cohesion',
    videoTitleEn: 'Warmth Inside a Cup of Traditional Kopi',
    backgroundContextEn:
      'Neighbourhood kopitiams serve as Singapore’s informal living rooms where neighbours gather over kopi and kaya toast, blending traditional craftsmanship with modern cafés.',
    primaryQuestionEnHint:
      'After watching this clip, share your views on the cultural value of traditional kopitiams and how they can stay relevant.',
  },
  'topic-culture-museum-arts': {
    titleEn: 'Visiting Museums & Cultivating Arts Appreciation',
    themeEn: 'Cultural Enrichment & Lifelong Learning',
    videoTitleEn: 'Beyond Shopping Malls: Listening to History in Museums',
    backgroundContextEn:
      'With free citizen entry and interactive exhibitions at the National Museum and Peranakan Museum, museums offer youths engaging ways to understand Singapore’s roots.',
    primaryQuestionEnHint:
      'After watching this clip, what do you think about encouraging teenagers to visit museums and cultural venues during leisure time?',
  },
  'topic-youth-failure-resilience': {
    titleEn: 'Bouncing Back from Setbacks & Building Resilience',
    themeEn: 'Growth Mindset & Emotional Strength',
    videoTitleEn: 'After Stumbling: Grades Never Define Your Worth',
    backgroundContextEn:
      'Exam setbacks are learning feedback rather than permanent labels. Analysing mistake notebooks, seeking teacher guidance, and family encouragement build grit.',
    primaryQuestionEnHint:
      'After watching this clip, how should teenagers face academic or personal setbacks and build resilience?',
  },
  'topic-youth-teamwork-cca': {
    titleEn: 'Teamwork & Resolving Conflicts in School CCAs',
    themeEn: 'Leadership & Collaboration',
    videoTitleEn: 'From Arguing to Moving in Sync as One Team',
    backgroundContextEn:
      'Co-Curricular Activities (CCAs) teach youths active listening, fair role-sharing, and mutual support when teammates hold clashing ideas under pressure.',
    primaryQuestionEnHint:
      'After watching this clip, share your views on learning teamwork and handling disagreements in CCAs.',
  },
  'topic-youth-filial-gratitude': {
    titleEn: 'Appreciating Parents’ Effort & Practising Everyday Gratitude',
    themeEn: 'Filial Piety & Family Communication',
    videoTitleEn: 'Never Take Quiet Love for Granted',
    backgroundContextEn:
      'Teens often take daily meals, errands, and parents’ quiet sacrifices for granted. Sharing chores, speaking gently, and saying thank you strengthen family harmony.',
    primaryQuestionEnHint:
      'After watching this clip, how can teenagers show understanding and everyday gratitude toward their parents?',
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
