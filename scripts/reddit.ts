// reddit.ts
export async function searchReddit(query: string, limit = 10) {
  const url = new URL("https://www.reddit.com/search.json");
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "new"); // or 'relevance', 'hot', etc.
  url.searchParams.set("limit", limit.toString());

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "hazard-monitor/1.0" }, // important for Reddit API
  });

  if (!res.ok) throw new Error("Failed to fetch search results");

  const data = await res.json();
  return data.data.children.map((p: any) => p.data);
}

// Example usage
(async () => {
  const posts = await searchReddit("tsunami India", 10);
  console.log(posts);
})();
