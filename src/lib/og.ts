import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Cache font buffer across calls during build
let fontBuffer: ArrayBuffer | null = null;

function getFont(): ArrayBuffer {
  if (fontBuffer) return fontBuffer;
  const fontPath = join(process.cwd(), 'src/assets/fonts/JetBrainsMono-Regular.ttf');
  fontBuffer = readFileSync(fontPath).buffer as ArrayBuffer;
  return fontBuffer;
}

interface OgImageOptions {
  title: string;
  subtitle?: string;
  prompt?: string;
}

// Catppuccin Mocha palette
const colors = {
  background: '#1e1e2e',
  card: '#313244',
  foreground: '#cdd6f4',
  muted: '#a6adc8',
  border: '#45475a',
  primary: '#cba6f7',
  green: '#a6e3a1',
  yellow: '#f9e2af',
  red: '#f38ba8',
  peach: '#fab387',
};

export async function generateOgImage({
  title,
  subtitle = 'ifandelse.com · Jim Cowart',
  prompt = '$ cat post.md',
}: OgImageOptions): Promise<Buffer> {
  const font = getFont();

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: colors.background,
          padding: '40px',
          fontFamily: 'JetBrains Mono',
        },
        children: {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              backgroundColor: colors.card,
              borderRadius: '16px',
              border: `2px solid ${colors.border}`,
              overflow: 'hidden',
            },
            children: [
              // Title bar
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    backgroundColor: '#2a2a3c',
                    gap: '10px',
                  },
                  children: [
                    // Window dots
                    { type: 'div', props: { style: { width: '16px', height: '16px', borderRadius: '50%', backgroundColor: colors.red } } },
                    { type: 'div', props: { style: { width: '16px', height: '16px', borderRadius: '50%', backgroundColor: colors.yellow } } },
                    { type: 'div', props: { style: { width: '16px', height: '16px', borderRadius: '50%', backgroundColor: colors.green } } },
                    // Path
                    {
                      type: 'div',
                      props: {
                        style: { marginLeft: '16px', fontSize: '18px', color: colors.muted },
                        children: '~/ifandelse',
                      },
                    },
                  ],
                },
              },
              // Terminal body
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    padding: '32px 36px',
                    justifyContent: 'center',
                    gap: '32px',
                  },
                  children: [
                    // Content area
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', gap: '20px' },
                        children: [
                          // Prompt line
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', gap: '12px', fontSize: '22px' },
                              children: [
                                { type: 'span', props: { style: { color: colors.green }, children: '$' } },
                                { type: 'span', props: { style: { color: colors.yellow }, children: prompt.replace('$ ', '') } },
                              ],
                            },
                          },
                          // Title
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: title.length > 60 ? '36px' : '44px',
                                fontWeight: 700,
                                color: colors.foreground,
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              },
                              children: title,
                            },
                          },
                        ],
                      },
                    },
                    // Footer
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '20px',
                        },
                        children: [
                          { type: 'span', props: { style: { color: colors.primary }, children: 'if(and)else' } },
                          { type: 'span', props: { style: { color: colors.muted }, children: subtitle.replace('ifandelse.com · ', '') } },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'JetBrains Mono',
          data: font,
          weight: 400,
          style: 'normal',
        },
      ],
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}
