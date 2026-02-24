---
name: new-post
description: Scaffold a new blog post file with frontmatter. Creates the file in src/content/blog/ — you write the content.
disable-model-invocation: true
argument-hint: [post title]
---

Create a new blog post file. The post title is: $ARGUMENTS

## Steps

1. **Slug the title** using the same logic as `src/lib/utils.ts:slugify` — lowercase, strip non-word characters (keep letters, numbers, spaces, hyphens), replace spaces with hyphens, collapse consecutive hyphens, trim.

2. **Ask the user** two quick questions:
   - What tags to apply (or none)
   - Whether they want `.md` or `.mdx` (default `.mdx` if they don't care)

3. **Create the file** at `src/content/blog/{slug}.md` or `src/content/blog/{slug}.mdx` with this exact structure:

```yaml
---
title: "The Title They Provided"
description: ""
date: YYYY-MM-DD
tags: ["tag1", "tag2"]
draft: true
---
```

Use today's date. Start as `draft: true`.

4. **Do NOT write any body content below the frontmatter.** No placeholder text, no outline, no headings, nothing. The user writes their own words.

5. **Report the file path** so the user can open it and start writing.
