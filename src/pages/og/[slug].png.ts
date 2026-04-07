import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { filterDrafts, sortPostsByDate } from '../../lib/utils';
import { generateOgImage } from '../../lib/og';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  const sortedPosts = sortPostsByDate(filterDrafts(posts));

  return sortedPosts.map((post) => ({
    params: { slug: post.slug },
    props: { title: post.data.title },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await generateOgImage({ title: props.title });

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
