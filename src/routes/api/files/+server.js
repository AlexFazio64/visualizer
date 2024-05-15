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

export function GET() {
  try {
    const files = fs.readdirSync(PATH);
    return new Response(JSON.stringify(files), {
      headers: {
        type: "application/json",
      },
    });
  } catch (error) {
    console.error("Error reading directory:", error);
    return {
      status: 500,
      body: JSON.stringify({ error: "Error reading directory" }),
    };
  }
}