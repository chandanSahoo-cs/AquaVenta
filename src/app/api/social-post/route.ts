import { NextResponse } from "next/server";

// --- Type Definitions for API responses ---
interface RedditPostData {
  title: string;
  selftext: string;
  thumbnail: string;
}

interface RedditPost {
  data: RedditPostData;
}

interface RedditApiResponse {
  data: {
    children: RedditPost[];
  };
}

interface Tweet {
  text: string;
}

interface TwitterApiResponse {
  data: Tweet[];
}
// -----------------------------------------

export async function GET() {
  let redditData = {};
  let xData = {};
  try {
    const redditRes = await searchReddit("tsunami India");
    redditData = redditRes.data.children.map((res: RedditPost) => {
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
    const xRes = await searchTweets("tsunami India");
    xData = xRes.data.map((res: Tweet) => {
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

async function searchReddit(query: string): Promise<RedditApiResponse> {
  const url = new URL("https://www.reddit.com/search.json");
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "new");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; HazardMonitor/1.0; +https://aqua-venta.vercel.app)",
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch search results");

  const data = await res.json();

  return data;
}

export async function searchTweets(query: string): Promise<TwitterApiResponse> {
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
