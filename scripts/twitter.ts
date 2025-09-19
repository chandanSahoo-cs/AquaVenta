// twitter.ts
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN!;

export async function searchTweets(query: string) {
  const url = new URL("https://api.twitter.com/2/tweets/search/recent");
  url.searchParams.set("query", query);
  url.searchParams.set("max_results", "50"); // up to 100
  url.searchParams.set(
    "tweet.fields",
    "created_at,author_id,lang,public_metrics"
  );

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
  });

  if (!res.ok) throw new Error("Failed to fetch tweets");

  return res.json();
}

// Example usage
(async () => {
  const data = await searchTweets("tsunami India");
  console.log(data);
})();
