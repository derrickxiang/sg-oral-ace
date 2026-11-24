import fs from 'fs';
import path from 'path';
import { ORAL_TOPICS } from '../src/data/topics.ts';

interface FlowPromptItem {
  index: number;
  id: string;
  filename: string;
  title: string;
  theme: string;
  flowQuickPrompt: string;
  flowFourScenePrompts: string[];
  suggestedDurationSec: number;
  cameraStyle: string;
}

const batchPrompts: FlowPromptItem[] = ORAL_TOPICS.map((topic, i) => {
  const sceneDescriptions = topic.scenes
    .map((s, idx) => `Shot ${idx + 1}: ${s.imagePromptDescription}`)
    .join('. ');

  const quickPrompt = `Cinematic 16:9 documentary, Singapore local setting, authentic tropical daylight, Leica 35mm lens, natural film grain, photorealistic. ${topic.scenes[0]?.imagePromptDescription || topic.title}. Natural movements, realistic Singaporean residents, quiet ambient sound, high detail, 1080p.`;

  const fourScenes = topic.scenes.map((s, idx) => {
    return `Shot ${idx + 1} (${s.timestamp}): ${s.imagePromptDescription}. Singapore documentary realism, photorealistic 16:9, natural sunlight, cinematic slow camera movement.`;
  });

  return {
    index: i + 1,
    id: topic.id,
    filename: `${topic.id}.mp4`,
    title: topic.title,
    theme: topic.theme,
    flowQuickPrompt: quickPrompt,
    flowFourScenePrompts: fourScenes,
    suggestedDurationSec: topic.duration,
    cameraStyle: 'Cinematic documentary, Leica 35mm, slow dolly in / pan, natural lighting',
  };
});

// Output Markdown Cheatsheet
let mdContent = `# 🎬 Google Flow / Veo 批量生成 20 套新加坡华文口试练习视频提示词矩阵

> **目标**：为新加坡 O-Level 华文口试 20 个日常主题快速批量生成 16:9 真实纪实考试短片。  
> **放置路径**：生成后将视频保存命名为 \`[题目ID].mp4\`，直接放入项目的 \`public/videos/\` 文件夹即可自动生效。

---

## ⚡ 极速批量操作口诀（15-20分钟完成全套）

1. **开启 4~5 个 Chrome 标签页** 并行打开 Google Flow / VideoFX 界面。
2. **复制下表【极速单段提示词 (16:9)】**，粘贴到提示框，长宽比选择 **16:9**。
3. **点击 Generate**：利用后台渲染排队机制，依次提交 1 到 20 题。
4. **下载并重命名**：按每题对应的【目标文件名】重命名为 \`topic-xxx.mp4\`。
5. **一键放入**：将 20 个 mp4 文件直接复制到项目 \`public/videos/\`，系统会自动优先读取并播放真实视频！

---

## 📋 20 个题目标准提示词清单

`;

batchPrompts.forEach((item) => {
  mdContent += `### 第 ${item.index} 题：${item.title}
- **题目 ID / 文件名**：\`${item.filename}\`
- **主题维度**：${item.theme}
- **建议时长**：${item.suggestedDurationSec} 秒 (考试纪实短片)
- **【极速单段 Google Flow 提示词】（推荐，直接复制）：**
\`\`\`text
${item.flowQuickPrompt}
\`\`\`

- **【4段完整分镜头提示词】（进阶剪辑拼接用）：**
${item.flowFourScenePrompts.map((p) => `  - \`${p}\``).join('\n')}

---

`;
});

// Write to files
const outputPathMd = path.join(process.cwd(), 'public', 'google_flow_20_topics_prompts.md');
const outputPathJson = path.join(process.cwd(), 'public', 'google_flow_prompts.json');

fs.writeFileSync(outputPathMd, mdContent, 'utf-8');
fs.writeFileSync(outputPathJson, JSON.stringify(batchPrompts, null, 2), 'utf-8');

console.log(`Successfully generated:\n- ${outputPathMd}\n- ${outputPathJson}`);
