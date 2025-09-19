import { NextResponse } from "next/server";

export async function GET(req: Request) {
  let redditData = {},
    xData = {};
  try {
    const redditRes = (await searchReddit("tsunami India")) as any;
    redditData = redditRes.data.children.map((res: any) => {
      return {
        title: res.data.title,
        selfText: res.data.selftext,
        media: res.data.thumbnail,
      };
    });
  } catch (error) {
    console.error("Reddit: ", error);
  }

  try {
    const xRes = (await searchTweets("tsunami India")) as any;
    xData = xRes.data.map((res: any) => {
      return {
        title: "",
        selfText: res.text,
        media: "",
      };
    });
  } catch (error) {
    console.error("X: ", error);
  }

  return NextResponse.json({
    ok: !!redditData || !!xData,
    postData: {
      reddit: redditData,
      x: xData,
    },
  });
}

async function searchReddit(query: string) {
  const url = new URL("https://www.reddit.com/search.json");
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "new");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "hazard-monitor/1.0" }, // important for Reddit API
  });

  if (!res.ok) throw new Error("Failed to fetch search results");

  const data = await res.json();

  return data;
}

export async function searchTweets(query: string) {
  const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN!;
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

  const data = await res.json();
  return data;
}
