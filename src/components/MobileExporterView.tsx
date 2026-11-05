import React, { useState } from 'react';
import {
  Smartphone,
  Apple,
  FileCode,
  Download,
  Copy,
  Check,
  Globe,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Layers,
  Terminal,
} from 'lucide-react';

export const MobileExporterView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<'appstore' | 'playstore' | 'capacitor'>('playstore');

  const copyText = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Metadata specifications
  const metadata = {
    appNameZh: '狮城口试宝 - 新加坡O水准华文口试AI陪练',
    appNameEn: 'OralPass SG - O-Level Chinese Oral Sparring',
    shortDescriptionZh: '专为新加坡中学生打造的O水准华文口试AI陪练！真实生活短片、考官智能追问、三项核心诊断与发音纠错。',
    shortDescriptionEn: 'AI Sparring companion for Singapore O-Level Chinese Oral (SEAB Paper 3). Video topics, examiner follow-up & tone diagnosis.',
    keywords: 'Singapore O Level, 华文口试, SEAB, 新加坡中学生, 口试录像, 会话追问, 考官评分, 发音纠错, 熟食中心, 快捷华文, 高级华文',
    category: 'Education (教育)',
    contentRating: 'Everyone 3+ / Ages 4+',
    supportEmail: 'support@oralpass.sg',
    privacyUrl: 'https://oralpass.sg/privacy-policy',
  };

  const fullDescriptionZh = `【狮城口试宝 - 新加坡O水准华文口试AI陪练】
专为新加坡中三、中四及中五快捷/普通学术源流考生量身定制，严格遵循新加坡教育部（MOE）与考评局（SEAB）GCE O-Level 华文试卷三（Paper 3）录像口试与深入会话评分标准！

告别找老师陪练难、不敢开口开口就忘词的烦恼！随时随地，在手机上与专业AI考官进行真实全拟真口试模拟。

🔥 核心四大备考体验：
1. 真实狮城生活话题短片
精选小贩中心文明归还托盘、独居乐龄跨代义工、实马高岛绿色减塑、青少年防范电信诈骗等高频本地会考热点。画面生动，配备规范旁白与字幕。

2. 考官深度智能追问 (Follow-up Question)
拒绝千篇一律的固定问答！AI模拟新加坡资深华文口试考官，根据考生刚才回答的具体论述深度与漏洞，即时提出精准追问，考察应变与思维广度。

3. 独创核心三项诊断反馈
每一题作答后，考官提供条理清晰的定向诊断：
- 🌟 哪里表达清楚：肯定你的观点亮点与逻辑衔接词
- ⚠️ 哪里缺少理由：精准指出论证空白、缺少个人见闻或多维视角的盲区
- 💡 下一次怎么改：提供“ORID”或“总-分-总”示范句式，指明立竿见影的提分路径

4. 同类题再练一次，前后对比肉眼可见
运用刚刚学到的提分锦囊，同话题或同类新题立即重练，系统直观对比两次练习的得分、论点充实度、词汇升级与发音进步。

5. 专属发音纠错与高分语料库
智能扫描多音字（如“角色 jué”、“提供 gōng”）与新加坡华语常见声调陷阱，一键播放标准普通话朗读示范，牢牢把握语音分。

提升华文口试自信，冲刺Band 1！立即下载体验！`;

  const capacitorConfig = `{
  "appId": "sg.oralpass.app",
  "appName": "狮城口试宝",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#DC2626"
    }
  }
}`;

  const androidManifestSnippet = `<!-- AndroidManifest.xml 录音与网络核心权限配置 -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="sg.oralpass.app">

    <!-- 录制口试语音与麦克风访问权限 -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <!-- AI评测与短片加载网络权限 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">
        <!-- 主入口配置 -->
    </application>
</manifest>`;

  const iosPlistSnippet = `<!-- iOS Info.plist 麦克风与语音识别合规说明 (App Store 审核必备) -->
<key>NSMicrophoneUsageDescription</key>
<string>狮城口试宝需要访问您的麦克风，以便录制您在模拟新加坡O水准华文口试中的回答并进行发音与逻辑评测。</string>

<key>NSSpeechRecognitionUsageDescription</key>
<string>用于实时识别您的华语口试作答内容，并转录为文本供AI考官生成追问与三项诊断反馈。</string>

<key>UIRequiresFullScreen</key>
<true/>
<key>UIStatusBarStyle</key>
<string>UIStatusBarStyleDarkContent</string>`;

  const cliCommands = `# 跨平台移动端一键构建与发布命令
# 1. 构建 Web 资源
npm run build

# 2. 安装并初始化 Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init "狮城口试宝" "sg.oralpass.app" --web-dir dist

# 3. 添加 Android / iOS 原生项目工程
npx cap add android
npx cap add ios

# 4. 同步代码并用 Android Studio / Xcode 打开打包
npx cap sync
npx cap open android   # 生成 Google Play (.aab) 上架包
npx cap open ios       # 生成 App Store (.ipa) 提交归档`;

  const downloadFullPackageJson = () => {
    const bundle = {
      appMetadata: metadata,
      fullDescriptionZh,
      capacitorConfig: JSON.parse(capacitorConfig),
      androidManifestSnippet,
      iosPlistSnippet,
      buildInstructions: cliCommands,
      exportTimestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'oralpass-sg-mobile-store-package.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-zinc-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-red-600/30 border border-red-500/40 text-red-300 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <Smartphone className="w-3.5 h-3.5" />
              <span>跨平台移动端代码与应用商店发布包</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Google Play & App Store 上架元数据中心
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-2xl leading-relaxed">
              包含完整的跨平台 Capacitor 原生工程配置、麦克风权限清单、中英文双语商店文案、ASO 关键词以及一键导出配置文件。
            </p>
          </div>

          <button
            onClick={downloadFullPackageJson}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-red-900/40 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>下载完整上架元数据包 (JSON)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActivePlatform('playstore')}
          className={`pb-3 transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activePlatform === 'playstore'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Google Play Store (Android)</span>
        </button>

        <button
          onClick={() => setActivePlatform('appstore')}
          className={`pb-3 transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activePlatform === 'appstore'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Apple className="w-4 h-4" />
          <span>Apple App Store (iOS)</span>
        </button>

        <button
          onClick={() => setActivePlatform('capacitor')}
          className={`pb-3 transition-colors cursor-pointer flex items-center space-x-1.5 ${
            activePlatform === 'capacitor'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>跨平台原生配置与命令 (Capacitor)</span>
        </button>
      </div>

      {/* Content depending on platform */}
      {activePlatform === 'playstore' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center justify-between">
              <span>Google Play 商店元数据配置 (Google Play Console)</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                审核合规标准
              </span>
            </h3>

            {/* Field: App Title */}
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span className="font-bold text-gray-700">应用名称 (App Title · 30字符限制)：</span>
                <button
                  onClick={() => copyText('titleZh', metadata.appNameZh)}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  {copiedKey === 'titleZh' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'titleZh' ? '已复制' : '复制'}</span>
                </button>
              </div>
              <p className="font-mono text-sm font-semibold text-gray-900">{metadata.appNameZh}</p>
            </div>

            {/* Field: Short Description */}
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span className="font-bold text-gray-700">简短说明 (Short Description · 80字符限制)：</span>
                <button
                  onClick={() => copyText('shortZh', metadata.shortDescriptionZh)}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  {copiedKey === 'shortZh' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'shortZh' ? '已复制' : '复制'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-800">{metadata.shortDescriptionZh}</p>
            </div>

            {/* Field: Full Description */}
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span className="font-bold text-gray-700">完整说明 (Full Description · 4000字符限制)：</span>
                <button
                  onClick={() => copyText('fullZh', fullDescriptionZh)}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  {copiedKey === 'fullZh' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'fullZh' ? '已复制' : '复制全文'}</span>
                </button>
              </div>
              <textarea
                readOnly
                rows={10}
                value={fullDescriptionZh}
                className="w-full text-xs font-mono bg-white p-3 rounded-lg border border-gray-200 text-gray-800"
              />
            </div>

            {/* Field: Tags & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <span className="text-[11px] text-gray-500 block">应用类别</span>
                <strong className="text-xs text-gray-800">{metadata.category}</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <span className="text-[11px] text-gray-500 block">内容分级</span>
                <strong className="text-xs text-gray-800">{metadata.contentRating}</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <span className="text-[11px] text-gray-500 block">ASO 关键字</span>
                <strong className="text-xs text-gray-800 truncate block">{metadata.keywords}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {activePlatform === 'appstore' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center justify-between">
              <span>Apple App Store 元数据 (App Store Connect)</span>
              <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-200">
                iOS 审核优化
              </span>
            </h3>

            {/* Info.plist permissions */}
            <div className="bg-gray-900 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span className="font-mono">Info.plist (隐私说明 · 必填项)：</span>
                <button
                  onClick={() => copyText('plist', iosPlistSnippet)}
                  className="flex items-center space-x-1 text-red-400 hover:text-red-300"
                >
                  {copiedKey === 'plist' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'plist' ? '已复制' : '复制代码'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap p-2 bg-black/40 rounded-lg">
                {iosPlistSnippet}
              </pre>
            </div>

            {/* Promotional text */}
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span className="font-bold text-gray-700">宣传文本 (Promotional Text · 170字符限制)：</span>
                <button
                  onClick={() => copyText('promo', '新加坡中学会考华文口试备考神器！精选真实生活短片，AI模拟考官智能追问与三项核心反馈，助你稳拿口试高分！')}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  {copiedKey === 'promo' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'promo' ? '已复制' : '复制'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-800">
                新加坡中学会考华文口试备考神器！精选真实生活短片，AI模拟考官智能追问与三项核心反馈，助你稳拿口试高分！
              </p>
            </div>
          </div>
        </div>
      )}

      {activePlatform === 'capacitor' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base">
              跨平台打包配置与自动化命令
            </h3>

            {/* CLI Build script */}
            <div className="bg-gray-900 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span className="font-mono">快速终端构建步骤 (Terminal CLI)：</span>
                <button
                  onClick={() => copyText('cli', cliCommands)}
                  className="flex items-center space-x-1 text-red-400 hover:text-red-300"
                >
                  {copiedKey === 'cli' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'cli' ? '已复制' : '复制命令'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-amber-300 overflow-x-auto whitespace-pre-wrap p-2 bg-black/40 rounded-lg">
                {cliCommands}
              </pre>
            </div>

            {/* capacitor.config.json */}
            <div className="bg-gray-900 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span className="font-mono">capacitor.config.json：</span>
                <button
                  onClick={() => copyText('capConfig', capacitorConfig)}
                  className="flex items-center space-x-1 text-red-400 hover:text-red-300"
                >
                  {copiedKey === 'capConfig' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'capConfig' ? '已复制' : '复制配置'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap p-2 bg-black/40 rounded-lg">
                {capacitorConfig}
              </pre>
            </div>

            {/* AndroidManifest.xml */}
            <div className="bg-gray-900 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span className="font-mono">AndroidManifest.xml 核心权限与声明：</span>
                <button
                  onClick={() => copyText('manifest', androidManifestSnippet)}
                  className="flex items-center space-x-1 text-red-400 hover:text-red-300"
                >
                  {copiedKey === 'manifest' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'manifest' ? '已复制' : '复制配置'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap p-2 bg-black/40 rounded-lg">
                {androidManifestSnippet}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
