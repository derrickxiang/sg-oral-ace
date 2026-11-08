import React, { useState } from 'react';
import { CorpusSuggestion } from '../types/oral';
import { BookOpen, Sparkles, Copy, Check, GitMerge, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CorpusCardProps {
  corpusSuggestions: CorpusSuggestion;
  onSavePhrase?: (phrase: string) => void;
}

export const CorpusCard: React.FC<CorpusCardProps> = ({
  corpusSuggestions,
}) => {
  const { t } = useLanguage();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
            {t('Lex', '库')}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg">
              {t('Deep Corpus Analysis & Logic Connectives', '语料库深度分析与高分逻辑提升')}
            </h3>
            <p className="text-xs text-gray-500">
              {t(
                'Strengthen logical flow with Singapore O-Level vocabulary & discourse markers',
                '结合新加坡语料库，强化答题逻辑链条，告别单一干瘪的平铺直叙'
              )}
            </p>
          </div>
        </div>

        <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full border border-indigo-200">
          {t('Curated O-Level Corpus', '高分语料库精选')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Logic Connectors */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-1.5 uppercase tracking-wide">
            <GitMerge className="w-4 h-4 text-indigo-600" />
            <span>
              {t(
                'Recommended Logical Connectives (Progressive · Causal · Contrastive):',
                '高频逻辑衔接词推荐（递进 · 因果 · 转折）：'
              )}
            </span>
          </h4>

          <div className="space-y-2.5">
            {corpusSuggestions.connectives.map((conn, idx) => (
              <div key={idx} className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                    {conn.type} {t('Connective', '衔接')}
                  </span>
                  <div className="flex space-x-1">
                    {conn.words.map((w, i) => (
                      <span key={i} className="text-xs font-semibold text-gray-800 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-indigo-950 italic bg-white/70 p-2 rounded-lg border border-indigo-100/60 flex items-center justify-between">
                  <span>“{conn.example}”</span>
                  <button
                    onClick={() => copyToClipboard(conn.example)}
                    className="ml-2 text-gray-400 hover:text-indigo-600 p-1 shrink-0"
                    title={t('Copy example sentence', '复制例句')}
                  >
                    {copiedText === conn.example ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Singapore Idioms & Terminology */}
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-1.5 uppercase tracking-wide mb-2.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>
                {t('High-Scoring Idioms & Proverbs (成语锦囊):', '口试成语锦囊（提分必背）：')}
              </span>
            </h4>

            <div className="space-y-2">
              {corpusSuggestions.idiomsAndProverbs.map((item, idx) => (
                <div key={idx} className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-amber-950 font-serif">
                      {item.phrase}
                    </span>
                    <span className="text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-medium">
                      {item.usageContext}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('Meaning: ', '释义：')}
                    {item.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {corpusSuggestions.singaporeTerms && corpusSuggestions.singaporeTerms.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-1.5 uppercase tracking-wide mb-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>
                  {t('Singapore Context Standard Chinese Terms:', '新加坡本地特色规范用语：')}
                </span>
              </h4>
              <div className="space-y-1.5">
                {corpusSuggestions.singaporeTerms.map((st, i) => (
                  <div key={i} className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-2 text-xs flex items-center justify-between">
                    <strong className="text-emerald-950">{st.term}</strong>
                    <span className="text-emerald-800 text-[11px]">{st.properUsage}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

