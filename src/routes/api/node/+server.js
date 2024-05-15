import fs from "fs";
import path from "path";

const PATH = path.join(
  "D:",
  "AlexFazio64",
  "Dev",
  "masters",
  "scraper",
  "content"
);

export function GET(req) {
  try {
    const node = fs.readFileSync(
      path.join(PATH, req.url.searchParams.get("dir"), "content.json")
    );

    return new Response(node);
  } catch (error) {
    console.error("Error reading node:", error);
    return new Response(JSON.stringify({ error: "Error reading node" }), {
      status: 500,
    });
  }
}
