// scripts/build-posts-index.mjs
import fg from "fast-glob";
import fs from "fs/promises";
import matter from "gray-matter";

const FILES_GLOB = "content/posts/*.md";
const OUT = "content/posts/posts.json";

// very small markdown → text stripper (no extra deps)
function stripMarkdown(md) {
  return (
    md
      // remove code fences
      .replace(/```[\s\S]*?```/g, " ")
      // inline code
      .replace(/`[^`]*`/g, " ")
      // images ![alt](url)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      // links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      // headings, quotes, lists, emphasis, hr
      .replace(/(^|\n)\s{0,3}(#+|\*|-|>|\d+\.)\s?/g, " ")
      .replace(/[*_~`>#-]/g, " ")
      // collapse whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

function makeExcerpt(bodyText, maxLen = 160) {
  if (!bodyText) return "";
  let s = bodyText.slice(0, maxLen + 20); // small buffer to finish a word
  if (s.length > maxLen) {
    // cut at last space before the limit
    const cut = s.lastIndexOf(" ", maxLen);
    s = s.slice(0, cut > 60 ? cut : maxLen);
  }
  return s.replace(/\s+/g, " ").trim();
}

function firstImageUrl(md) {
  // markdown image ![alt](url)
  const m = md.match(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)/);
  return m ? m[1] : "";
}

const files = await fg(FILES_GLOB);
const posts = [];

for (const file of files) {
  const src = await fs.readFile(file, "utf-8");
  const { data, content } = matter(src);

  // require these three to show on the grid
  if (!data || !data.title || !data.slug || !data.date) continue;

  const bodyText = stripMarkdown(content);
  const autoExcerpt = makeExcerpt(bodyText, 160);

  // prefer front-matter excerpt; otherwise use generated
  const excerpt = (data.excerpt && String(data.excerpt).trim()) || autoExcerpt;

  // prefer front-matter cover; otherwise first image in body
  const cover = data.cover || firstImageUrl(content) || "";

  posts.push({
    title: data.title,
    slug: data.slug,
    date:
      data.date instanceof Date ? data.date.toISOString() : String(data.date),
    author: data.author || "",
    cover,
    excerpt,
    filename: file.split("/").pop(),
  });
}

// newest first
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

await fs.writeFile(OUT, JSON.stringify(posts, null, 2));
console.log(`Wrote ${posts.length} posts to ${OUT}`);
