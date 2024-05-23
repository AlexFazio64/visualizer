import fs from "fs";
import path from "path";

const PATH = path.join(
  "D:",
  "AlexFazio64",
  "Dev",
  "masters",
  "scraper",
  "data"
);

export function GET() {
  let categories = fs.readFileSync(path.join(PATH, "categories.json"));
  categories = JSON.parse(categories);

  return new Response(JSON.stringify(categories), {
    headers: {
      type: "application/json",
    },
  });
}
