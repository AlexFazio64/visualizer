import fs from "fs";
import path from "path";

const PATH = path.join("wiki");

export function GET() {
  try {
    const files = fs
      .readdirSync(PATH)
      .filter((file) => file !== "categories.json");
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
