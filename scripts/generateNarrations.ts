import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { ORAL_TOPICS } from '../src/data/topics.ts';

dotenv.config();

const audioDir = path.resolve(process.cwd(), 'public', 'audio', 'narration');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

function cleanTextForSpeech(text: string): string {
  return text
    .replace(/【.*?】/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/（.*?）/g, '')
    .replace(/\(.*?\)/g, '')
    .trim();
}

async function main() {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    console.error('No valid GEMINI_API_KEY found in environment');
    process.exit(1);
  }

  const aiClient = new GoogleGenAI({});
  console.log('Starting offline pre-generation of all 20 video narration audio files...');

  const manifest: Record<string, string> = {};

  for (const topic of ORAL_TOPICS) {
    console.log(`\nTopic: ${topic.title} (${topic.id})`);
    for (let i = 0; i < topic.scenes.length; i++) {
      const scene = topic.scenes[i];
      const filename = `${topic.id}_scene_${i + 1}.wav`;
      const filePath = path.join(audioDir, filename);
      const textToSpeak = cleanTextForSpeech(scene.dialogue || scene.description);

      manifest[`${topic.id}_${i}`] = `/audio/narration/${filename}`;

      if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
        console.log(`  ✓ Scene ${i + 1} already generated: ${filename}`);
        continue;
      }

      console.log(`  Generating Scene ${i + 1} (${textToSpeak})...`);
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `请以生动流畅、亲切自然、吐字清晰的新加坡生活短片旁白风格朗读以下句子。带有真实纪录片旁白的温度与沉浸感：\n\n${textToSpeak}`,
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Kore',
                },
              },
            },
          },
        });

        const part = response?.candidates?.[0]?.content?.parts?.[0];
        if (part && 'inlineData' in part && part.inlineData?.data) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          fs.writeFileSync(filePath, buffer);
          console.log(`  ✓ Saved ${filename} (${buffer.length} bytes)`);
        } else {
          console.warn(`  ✗ Failed to get audio buffer for scene ${i + 1}`);
        }
      } catch (err) {
        console.error(`  ✗ Error generating audio for scene ${i + 1}:`, err);
      }

      // Small delay to prevent rate limits
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  fs.writeFileSync(
    path.join(audioDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
  console.log('\nAll narration audio pre-generation finished successfully!');
}

main().catch(console.error);
