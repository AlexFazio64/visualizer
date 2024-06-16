import fs from "fs";
import path from "path";

export async function POST({ request }) {
  const { data, name } = await request.json();

  fs.writeFileSync(
    path.join(process.cwd(), "static", "visualizer", name),
    JSON.stringify(data)
  );

  return new Response("stored");
}
