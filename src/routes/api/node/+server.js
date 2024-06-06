import fs from "fs";
import path from "path";

const PATH = path.join("wiki");

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
