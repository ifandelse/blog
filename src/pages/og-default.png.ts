import type { APIRoute } from 'astro';
import { generateOgImage } from '../lib/og';
import { siteConfig } from '../config';

export const GET: APIRoute = async () => {
  const png = await generateOgImage({
    title: siteConfig.title,
    subtitle: siteConfig.description,
    prompt: '$ cat site.txt',
  });

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
