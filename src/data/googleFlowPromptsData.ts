import { ORAL_TOPICS } from './topics';

export interface TopicFlowPrompt {
  index: number;
  id: string;
  filename: string;
  title: string;
  theme: string;
  duration: number;
  quickPrompt: string;
  fourScenePrompts: {
    shot: number;
    timestamp: string;
    description: string;
    prompt: string;
  }[];
}

export const GOOGLE_FLOW_TOPIC_PROMPTS: TopicFlowPrompt[] = ORAL_TOPICS.map((topic, i) => {
  const quickPrompt = `Cinematic 16:9 documentary, Singapore local setting, authentic tropical daylight, Leica 35mm lens, natural film grain, photorealistic. ${topic.scenes[0]?.imagePromptDescription || topic.title}. Natural movements, realistic Singaporean residents, quiet ambient sound, high detail, 1080p.`;

  const fourScenePrompts = topic.scenes.map((s, idx) => ({
    shot: idx + 1,
    timestamp: s.timestamp,
    description: s.description,
    prompt: `Shot ${idx + 1} (${s.timestamp}): ${s.imagePromptDescription}. Singapore documentary realism, photorealistic 16:9, natural sunlight, cinematic slow camera movement.`,
  }));

  return {
    index: i + 1,
    id: topic.id,
    filename: `${topic.id}.mp4`,
    title: topic.title,
    theme: topic.theme,
    duration: topic.duration,
    quickPrompt,
    fourScenePrompts,
  };
});

export function generateGoogleFlowMarkdown(): string {
  let md = `# 🎬 Google Flow / Veo 批量生成 20 套新加坡华文口试练习视频提示词矩阵

> **目标**：为新加坡 O-Level 华文口试 20 个日常主题快速批量生成 16:9 真实纪实考试短片。
> **放置路径**：生成后将视频保存命名为 \`[题目ID].mp4\`，直接放入项目的 \`public/videos/\` 文件夹即可自动生效。

---

## ⚡ 极速批量操作指南（15-20分钟完成全套）

1. **开启 4~5 个 Chrome 标签页** 并行打开 Google Flow / VideoFX 界面 (https://labs.google/fx/tools/flow)。
2. **复制下表【极速单段提示词 (16:9)】**，粘贴到提示框，长宽比选择 **16:9**。
3. **点击 Generate**：利用后台渲染排队机制，依次提交 1 到 20 题。
4. **下载并重命名**：按每题对应的【目标文件名】重命名为 \`topic-xxx.mp4\`。
5. **一键放入**：将 20 个 mp4 文件直接复制到项目 \`public/videos/\`，系统会自动优先读取并播放真实视频！

---

## 📋 20 个题目标准提示词清单

`;

  GOOGLE_FLOW_TOPIC_PROMPTS.forEach((item) => {
    md += `### 第 ${item.index} 题：${item.title}\n`;
    md += `- **题目 ID / 文件名**：\`${item.filename}\`\n`;
    md += `- **主题维度**：${item.theme}\n`;
    md += `- **建议时长**：${item.duration} 秒 (考试纪实短片)\n`;
    md += `- **【极速单段 Google Flow 提示词】（推荐，直接复制）：**\n\`\`\`text\n${item.quickPrompt}\n\`\`\`\n\n`;
    md += `- **【4段完整分镜头提示词】（进阶剪辑拼接用）：**\n`;
    item.fourScenePrompts.forEach((s) => {
      md += `  - \`${s.prompt}\`\n`;
    });
    md += `\n---\n\n`;
  });

  return md;
}
