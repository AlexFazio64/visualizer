import fs from "fs";
import path from "path";

const PATH = path.join("wiki");

export function GET() {
  let categories = fs.readFileSync(path.join(PATH, "categories.json"));
  categories = JSON.parse(categories);

  return new Response(JSON.stringify(categories), {
    headers: {
      type: "application/json",
    },
  });
}
