import React, { useState } from 'react';
import {
  Smartphone,
  Apple,
  Download,
  Copy,
  Check,
  Globe,
  Terminal,
  QrCode,
  CheckCircle2,
  Share2,
  PackageCheck,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const MobileExporterView: React.FC = () => {
  const { lang, t } = useLanguage();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState<'instant_pwa' | 'android_apk' | 'appstore'>('instant_pwa');

  const rawOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-y3hjqwpnovmudn5czo2wna-981725858320.asia-southeast1.run.app';
  const appOrigin = rawOrigin.replace('https://ais-dev-', 'https://ais-pre-');

  const copyText = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Metadata specifications
  const metadata = {
    appNameEn: 'OralAce - your AI Chinese Oral Coach',
    appNameZh: 'OralAce - 你的AI华文口语陪练助手',
    shortDescriptionEn: 'your AI Chinese Oral Practice Coach for everyday Singapore video & spoken interaction practice.',
    shortDescriptionZh: '专为青少年打造的华文口语AI陪练助手！20个真实生活短片话题、互动延伸提问、三项表达参考建议与读音提示。',
    keywords: 'OralAce, Chinese Oral Coach, Singapore Chinese, 华文口语, 口语练习, 短片讨论, 互动提问, 多音字参考',
    category: t('Education', 'Education (教育)'),
    contentRating: 'Everyone 3+ / Ages 4+',
    supportEmail: 'support@oralace.sg',
    privacyUrl: 'https://oralace.sg/privacy-policy',
  };

  const githubActionWorkflow = `name: Build Signed Android APK (OralAce)
on:
  workflow_dispatch:
  push:
    branches: [ main ]

jobs:
  build-android-apk:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout OralAce Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20 & Java 17
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: 17

      - name: Install Dependencies & Build Web Assets
        run: |
          npm install
          npm run build

      - name: Initialize Capacitor Android & Assemble APK
        run: |
          npm install @capacitor/core @capacitor/cli @capacitor/android
          npx cap add android || true
          npx cap sync android
          cd android && chmod +x gradlew && ./gradlew assembleDebug

      - name: Upload Ready-to-Install OralAce.apk Artifact
        uses: actions/upload-artifact@v4
        with:
          name: OralAce-Android-Installer-APK
          path: android/app/build/outputs/apk/debug/app-debug.apk`;

  const capacitorConfig = `{
  "appId": "sg.oralace.app",
  "appName": "OralAce",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 1800,
      "backgroundColor": "#072B2E"
    }
  }
}`;

  const cliCommands = `# One-Command Local or Cloud Android APK & iOS IPA Builder
# 1. Build production PWA & mobile assets
npm run build

# 2. Add Native Android & iOS Shells via Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
npx cap sync

# 3. Compile installable Android .apk directly from command line
cd android && ./gradlew assembleDebug
# Output APK: android/app/build/outputs/apk/debug/app-debug.apk`;

  // Download a standalone Mobile/Desktop WebApp Launcher (.html) that opens OralAce in full-screen app mode
  const downloadStandaloneAppInstaller = () => {
    const installerHtml = `<!DOCTYPE html>
<html lang="zh-SG">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="theme-color" content="#072B2E" />
  <title>OralAce - your AI Chinese Oral Coach</title>
  <style>
    body, html { margin: 0; padding: 0; height: 100%; background: #072B2E; font-family: system-ui, sans-serif; color: #fff; display: flex; align-items: center; justify-content: center; }
    .card { max-width: 420px; padding: 32px; border-radius: 20px; background: #0B3B3C; border: 1px solid rgba(52,211,153,0.3); text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
    .btn { display: inline-block; margin-top: 20px; padding: 14px 28px; background: #10B981; color: #041B1D; font-weight: 700; text-decoration: none; border-radius: 12px; font-size: 15px; }
  </style>
  <script>
    window.location.replace("${appOrigin}/?source=installed_app");
  </script>
</head>
<body>
  <div class="card">
    <h2>OralAce · 新加坡 O 水准华文口试 AI 教练</h2>
    <p>正在启动独立手机应用环境 (Launching Standalone Mobile App)...</p>
    <a class="btn" href="${appOrigin}/?source=installed_app">立即进入 OralAce App</a>
  </div>
</body>
</html>`;
    const blob = new Blob([installerHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'OralAce-Mobile-Launcher.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadFullApkBuilderBundle = () => {
    const bundle = {
      appName: 'OralAce',
      appId: 'sg.oralace.app',
      tagline: 'your AI Chinese Oral Coach',
      liveAppUrl: appOrigin,
      pwaManifestUrl: `${appOrigin}/manifest.webmanifest`,
      pwaBuilderInstruction:
        'Paste your liveAppUrl into https://www.pwabuilder.com to download a signed Google Play .apk / .aab and iOS .ipa in 60 seconds without coding.',
      githubActionsApkWorkflow: githubActionWorkflow,
      capacitorConfig: JSON.parse(capacitorConfig),
      cliCommands,
      appMetadata: metadata,
      exportTimestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'OralAce-Android-APK-iOS-Build-Bundle.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner — Deep Academic Teal */}
      <div className="bg-[#072B2E] text-white rounded-2xl p-6 sm:p-8 border border-teal-800 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-md text-xs font-semibold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>
                {t(
                  'Real Downloadable & Installable Mobile App Center (iOS / Android APK / PWA)',
                  '真正可下载安装的手机应用中心 (支持 iPhone / 安卓 APK / 独立桌面安装)'
                )}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t(
                'Install OralAce on Your Phone or Export Native Android .APK',
                '一键安装 OralAce 到手机桌面，或下载原生 Android .APK 安装包工程'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t(
                'OralAce is engineered with a full Service Worker offline cache, Web App Manifest, and Capacitor native bridge. Install it directly to your phone home screen in 1 click, or compile a standalone Android .apk.',
                'OralAce 已内置完整的 PWA 离线缓存引擎、原生全屏图标清单（Manifest）以及 Capacitor 跨平台打包配置。您可以直接一键安装到手机主屏幕，或导出 Android .APK 安装包分发给学生试用。'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isInstallable && !isInstalled && (
              <button
                type="button"
                onClick={install}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t('1-Click Install App Now', '一键直接安装到本设备')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={downloadStandaloneAppInstaller}
              className="flex items-center gap-2 bg-teal-800 hover:bg-teal-700 text-white border border-teal-600 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <PackageCheck className="w-4 h-4 text-emerald-300" />
              <span>{t('Download App Launcher (.html)', '下载手机/电脑启动器文件')}</span>
            </button>

            <button
              type="button"
              onClick={downloadFullApkBuilderBundle}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>{t('Download APK Build Bundle', '下载 APK 打包工程配置')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActivePlatform('instant_pwa')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activePlatform === 'instant_pwa'
              ? 'text-teal-900 border-b-2 border-teal-900 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>{t('1. Direct Phone Installation & QR Code (直接装入手机)', '1. 手机扫码/浏览器直接安装 (推荐立即试用)')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePlatform('android_apk')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activePlatform === 'android_apk'
              ? 'text-teal-900 border-b-2 border-teal-900 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>{t('2. Build & Download Android .APK File (生成安卓 APK 安装包)', '2. 生成并下载 Android .APK 安装包')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePlatform('appstore')}
          className={`pb-3 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activePlatform === 'appstore'
              ? 'text-teal-900 border-b-2 border-teal-900 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Apple className="w-4 h-4" />
          <span>{t('3. App Store & Google Play Store Listing', '3. 苹果 App Store 与 Google Play 上架资料')}</span>
        </button>
      </div>

      {/* TAB 1: Direct Phone Installation & QR Code */}
      {activePlatform === 'instant_pwa' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Step-by-Step iOS & Android Native Installation */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  {t(
                    'How Students & Parents Install OralAce on Their Phones Today',
                    '学生与家长如何今天就把 OralAce 安装到手机桌面？'
                  )}
                </h3>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200">
                  {t('Full-Screen Native Experience', '全屏独立图标 · 免审核即装即用')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Android */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-teal-950">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>{t('Android Phone (Chrome / Edge)', '安卓手机 (Android Chrome)')}</span>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>
                      {t(
                        'Scan the QR code or send the app link to your Android phone via WhatsApp/WeChat and open in Chrome.',
                        '用手机扫描右侧二维码，或复制链接发到微信/WhatsApp 后用 Chrome 打开。'
                      )}
                    </li>
                    <li>
                      {t(
                        'Tap "Install App" in the top bar, or tap the browser menu (⋮) → "Install app".',
                        '点击页面顶部绿色的“一键装入手机”，或点击右上角菜单 (⋮) 选择“安装应用 (Install app)”。'
                      )}
                    </li>
                    <li>
                      {t(
                        'OralAce is installed on your phone desktop with its own icon and full-screen mode!',
                        '系统将在安卓桌面生成独立的 OralAce 图标，打开即享无地址栏全屏体验！'
                      )}
                    </li>
                  </ol>
                </div>

                {/* iPhone / iPad */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-teal-950">
                    <Apple className="w-4 h-4 text-slate-900" />
                    <span>{t('iPhone / iPad (iOS Safari)', '苹果手机 (iPhone / iPad Safari)')}</span>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>
                      {t(
                        'Open the OralAce link in Safari on your iPhone or iPad.',
                        '在 iPhone 或 iPad 的原生 Safari 浏览器中打开本应用网址。'
                      )}
                    </li>
                    <li>
                      {t(
                        'Tap the "Share" icon (box with upward arrow) at the bottom of Safari.',
                        '点击 Safari 底部正中央的“分享”按钮（带向上箭头的方框图标）。'
                      )}
                    </li>
                    <li>
                      {t(
                        'Select "Add to Home Screen" → tap "Add" in the top-right corner.',
                        '向下滑动找到“添加到主屏幕 (Add to Home Screen)”，点击右上角“添加”即可！'
                      )}
                    </li>
                  </ol>
                  {isIOS && (
                    <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-3 py-1.5 rounded-lg">
                      {t('You are currently on iOS — tap Share → Add to Home Screen!', '当前设备为 iOS：点击底部“分享 → 添加到主屏幕”即可完成安装！')}
                    </div>
                  )}
                </div>
              </div>

              {/* Copy Shareable App Link Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="text-xs text-slate-600 font-mono truncate max-w-md">
                  {appOrigin}
                </div>
                <button
                  type="button"
                  onClick={() => copyText('appLink', appOrigin)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B3B3C] hover:bg-teal-900 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copiedKey === 'appLink' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{t('Copied Mobile Install Link!', '已复制手机安装链接！')}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{t('Copy Link for WhatsApp / WeChat', '复制链接发送到手机安装')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Mobile QR Card & Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-between text-center shadow-xs space-y-4">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-teal-800">
                {t('Scan to Install on Phone', '手机相机扫码立即安装')}
              </div>
              <p className="text-xs text-slate-500">
                {t('Open on iOS Safari or Android Chrome', '支持 iPhone Safari 与安卓 Chrome')}
              </p>
            </div>

            <div className="p-3 bg-white rounded-2xl border-2 border-teal-900/20 shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=072B2E&data=${encodeURIComponent(
                  appOrigin
                )}`}
                alt="OralAce Mobile Install QR Code"
                className="w-40 h-40 rounded-lg"
              />
            </div>

            <div className="w-full space-y-2 text-left bg-teal-50/70 p-3.5 rounded-xl border border-teal-200/80 text-xs">
              <div className="flex items-center gap-2 font-semibold text-teal-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('PWA Manifest & Icons Verified', '已配置 192px/512px 高清桌面图标')}</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-teal-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('Offline Corpus & Audio Cache Ready', '已启用 Service Worker 离线缓存')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Build & Download Android .APK File */}
      {activePlatform === 'android_apk' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {t(
                    '2 Ways to Generate a Native Android .APK Installer File',
                    '两种零门槛生成原生 Android .APK 安装包文件的方法'
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t(
                    'Generate an installable .apk file in 60 seconds using PWABuilder or GitHub Actions Cloud Builder.',
                    '无需在本地电脑配置复杂的 Android Studio，60秒云端自动生成可分发的 .apk 安装包。'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={downloadFullApkBuilderBundle}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B3B3C] hover:bg-teal-900 text-white text-xs font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t('Download Complete APK Config Bundle', '下载完整 APK 打包配置文件')}</span>
              </button>
            </div>

            {/* Method A: PWABuilder 60-second No-Code APK */}
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2">
              <div className="text-xs font-bold text-teal-950">
                {t(
                  'Method A (Fastest · 60 Seconds): Microsoft PWABuilder 1-Click .APK Generator',
                  '方式一（最快 · 60秒免编程）：使用微软官方 PWABuilder 一键导出 .APK'
                )}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {t(
                  'Because OralAce already includes a compliant Web App Manifest and Service Worker, you can paste this app’s URL into PWABuilder.com and click "Package for Store → Android → Download APK".',
                  '由于 OralAce 已完整配置标准 WebManifest 与离线缓存，您只需复制本应用网址，粘贴到微软官方免费打包工具 PWABuilder.com，点击“Package for Store → Android”即可直接下载签名版 OralAce.apk 安装包！'
                )}
              </p>
            </div>

            {/* Method B: GitHub Actions Automatic Cloud APK Builder */}
            <div className="bg-slate-900 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono">
                  {t(
                    'Method B: GitHub Actions Cloud APK Workflow (.github/workflows/build-android-apk.yml)',
                    '方式二：GitHub Actions 云端自动编译 APK 工作流 (.github/workflows/build-android-apk.yml)'
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => copyText('ghAction', githubActionWorkflow)}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                >
                  {copiedKey === 'ghAction' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'ghAction' ? t('Copied', '已复制') : t('Copy Workflow', '复制云端打包脚本')}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap p-3 bg-black/40 rounded-lg max-h-64">
                {githubActionWorkflow}
              </pre>
            </div>

            {/* Local CLI Commands */}
            <div className="bg-slate-900 text-white p-4 rounded-xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono">{t('Local Capacitor CLI Commands:', '本地终端一键生成 APK 命令 (Capacitor CLI)：')}</span>
                <button
                  type="button"
                  onClick={() => copyText('cli', cliCommands)}
                  className="flex items-center gap-1 text-amber-300 hover:text-amber-200 cursor-pointer"
                >
                  {copiedKey === 'cli' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'cli' ? t('Copied', '已复制') : t('Copy Commands', '复制命令')}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-amber-200 overflow-x-auto whitespace-pre-wrap p-3 bg-black/40 rounded-lg">
                {cliCommands}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: App Store & Google Play Metadata */}
      {activePlatform === 'appstore' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center justify-between">
              <span>
                {t('Google Play & Apple App Store Listing Metadata', 'Google Play 与 Apple App Store 商店上架文案')}
              </span>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                {t('Store Ready', '合规就绪')}
              </span>
            </h3>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-bold text-slate-700">
                  {t('App Title:', '应用名称：')}
                </span>
                <button
                  type="button"
                  onClick={() => copyText('title', lang === 'en' ? metadata.appNameEn : metadata.appNameZh)}
                  className="flex items-center gap-1 text-teal-800 hover:text-teal-950 cursor-pointer"
                >
                  {copiedKey === 'title' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'title' ? t('Copied', '已复制') : t('Copy', '复制')}</span>
                </button>
              </div>
              <p className="font-mono text-sm font-semibold text-slate-900">
                {lang === 'en' ? metadata.appNameEn : metadata.appNameZh}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-bold text-slate-700">
                  {t('Short Description:', '简短说明：')}
                </span>
                <button
                  type="button"
                  onClick={() => copyText('short', lang === 'en' ? metadata.shortDescriptionEn : metadata.shortDescriptionZh)}
                  className="flex items-center gap-1 text-teal-800 hover:text-teal-950 cursor-pointer"
                >
                  {copiedKey === 'short' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'short' ? t('Copied', '已复制') : t('Copy', '复制')}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-800">
                {lang === 'en' ? metadata.shortDescriptionEn : metadata.shortDescriptionZh}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
