import React, { useState } from 'react';
import {
  X,
  Copy,
  CheckCircle2,
  Download,
  Film,
  ExternalLink,
  Search,
} from 'lucide-react';
import { GOOGLE_FLOW_TOPIC_PROMPTS, generateGoogleFlowMarkdown } from '../data/googleFlowPromptsData';
import { useLanguage } from '../context/LanguageContext';

interface GoogleFlowBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopicId?: string;
}

export const GoogleFlowBatchModal: React.FC<GoogleFlowBatchModalProps> = ({
  isOpen,
  onClose,
  defaultTopicId,
}) => {
  const { t } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const handleCopySingle = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // fallback
    }
  };

  const handleCopyAll = async () => {
    try {
      const fullText = generateGoogleFlowMarkdown();
      await navigator.clipboard.writeText(fullText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 3000);
    } catch {
      // fallback
    }
  };

  const handleDownloadBlobMd = () => {
    const md = generateGoogleFlowMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Google_Flow_20_Oral_Topics_Prompts.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filtered = GOOGLE_FLOW_TOPIC_PROMPTS.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.theme.toLowerCase().includes(q)
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#041B1D] border border-teal-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-teal-800/80 bg-[#062426] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{t('Google Flow 20-Topic Video Prompts Matrix', 'Google Flow 20 题口试视频提示词中心')}</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  20 Topics Ready
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                {t(
                  '100% Client-Side Safe: Copy single/all or download authentic markdown without proxy cookie block.',
                  '安全免拦截：支持一键复制全部、单独复制或通过内存安全下载，杜绝 Cookie 验证页拦截。'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-teal-900 bg-[#031517] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('Search topic name, theme or filename...', '搜索题目、主题或文件名...')}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#072B2E] border border-teal-800 text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-white font-medium transition-colors cursor-pointer"
            >
              {copiedAll ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{t('All 20 Copied!', '全套 20 题已复制！')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('Copy All 20 Prompts', '一键复制全套 20 题')}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadBlobMd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('Download .md (Safe)', '安全下载 .md 文件')}</span>
            </button>

            <a
              href="https://labs.google/fx/tools/flow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-teal-700 font-medium transition-colors"
            >
              <span>{t('Open Google Flow', '打开 Google Flow')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-emerald-300">
                {t('Fastest Generation Tips (16:9 Documentary):', 'Google Flow 极速批量出片秘诀 (16:9 纪实画幅)：')}
              </p>
              <p className="text-slate-300 leading-relaxed">
                {t(
                  '1. Open 4~5 Chrome tabs with Google Flow in parallel. 2. Paste the Quick Prompt (16:9), click Generate. 3. Name the downloaded file as indicated (e.g. topic-hawker-tray.mp4) and drop it into public/videos/ for instant auto-play.',
                  '1. 在 Chrome 中并行打开 4～5 个 Google Flow 标签页；2. 复制各题的「极速单段提示词」，画幅选 16:9 依次点击 Generate；3. 下载后重命名为指定文件名并放入 public/videos/，系统即可自动识别播放！'
                )}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((item) => {
              const isTargetTopic = defaultTopicId === item.id;
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isTargetTopic
                      ? 'bg-[#062c30] border-emerald-500/80 shadow-md ring-1 ring-emerald-500/40'
                      : 'bg-[#052124] border-teal-800/80 hover:border-teal-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-teal-800/80 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center">
                        {String(item.index).padStart(2, '0')}
                      </span>
                      <h3 className="text-sm font-semibold text-white">
                        {item.title}
                      </h3>
                      {isTargetTopic && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/30 text-emerald-200 font-medium">
                          {t('Current Topic', '当前正在练习')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400 bg-black/30 px-2 py-0.5 rounded border border-teal-900">
                        {item.filename}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopySingle(item.id, item.quickPrompt)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-teal-800/80 hover:bg-teal-700 text-emerald-200 border border-teal-700'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                            <span>{t('Copied!', '已复制！')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{t('Copy Prompt', '复制提示词')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick Prompt block */}
                  <div className="relative group">
                    <pre className="p-3 bg-[#021012] border border-teal-950 rounded-lg text-xs font-mono text-emerald-300/90 whitespace-pre-wrap break-words leading-relaxed select-all">
                      {item.quickPrompt}
                    </pre>
                  </div>

                  {/* 4 Shots expandable details */}
                  <div className="mt-2.5 pt-2 border-t border-teal-900/60">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1">
                      {t('4-Shot Breakdown (Optional for multi-scene editing):', '4段分镜头细化（进阶多镜头拼接）：')}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-300 font-mono">
                      {item.fourScenePrompts.map((shot) => (
                        <div
                          key={shot.shot}
                          className="p-1.5 rounded bg-black/20 border border-teal-900/40 truncate"
                          title={shot.prompt}
                        >
                          <span className="text-emerald-400 font-semibold mr-1">
                            S{shot.shot} ({shot.timestamp}):
                          </span>
                          <span className="text-slate-300">{shot.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-teal-800/80 bg-[#062426] flex items-center justify-between text-xs text-slate-400">
          <span>{t('Singapore O-Level Standard: 16:9, Silent/Ambient Audio, 35mm Realism', '新加坡 O-Level 标准：16:9 画幅、纯环境音/无声、35mm 纪实风格')}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-white font-medium cursor-pointer"
          >
            {t('Close', '关闭')}
          </button>
        </div>
      </div>
    </div>
  );
};
