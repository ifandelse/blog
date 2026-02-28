// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
	site: 'https://ifandelse.com',
	redirects: {
		'/appreciation-awe': '/blog/appreciation-awe',
		'/appreciation-awe/': '/blog/appreciation-awe',
		'/heroes': '/blog/cult-of-the-toxic-hero',
		'/heroes/': '/blog/cult-of-the-toxic-hero',
		'/umd-for-everyone': '/blog/umd-for-everyone',
		'/umd-for-everyone/': '/blog/umd-for-everyone',
		'/its-not-hard-making-your-library-support-amd-and-commonjs': '/blog/amd-and-commonjs',
		'/its-not-hard-making-your-library-support-amd-and-commonjs/': '/blog/amd-and-commonjs',
	},
	integrations: [
		mdx(),
		sitemap()
	],
	vite: {
		plugins: [tailwindcss()]
	}
});
