import fs from "fs";
import path from "path";

import pg from "pg";
const { Client } = pg;

export async function GET({ url }) {
  let nodes = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "static", "nodes.json"), "utf-8")
  );

  nodes = nodes.map((node) => node.id);

  const client = new Client({
    host: "localhost",
    port: 5432,
    user: "alex",
    password: "password",
    database: "monogatari",
  });

  await client.connect();

  // await Promise.all(nodes.map((node) => write_embed_to_db(client, node)));
  const res = await query_db(client, url.searchParams.get("id"));
  console.log(res);

  await client.end();

  return new Response(JSON.stringify(nodes));
}

async function query_db(client, str) {
  // find the closest embeddings in the database based on the prompt
  const vec = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    body: JSON.stringify({
      model: "nomic-embed-text",
      prompt: str,
    }),
  });

  const json = await vec.json();

  const res = await client.query(
    "SELECT * FROM embeddings WHERE 1- (vec <=> $1) >= 0.7 ORDER BY (vec <=> $1) ASC LIMIT 4",
    [JSON.stringify(json.embedding)]
  );

  return res.rows.map((row) => row.id);
}

async function write_embed_to_db(client, str) {
  const res = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    body: JSON.stringify({
      model: "nomic-embed-text",
      prompt: str,
    }),
  });

  const json = await res.json();

  try {
    await client.query("INSERT INTO embeddings (id, vec) VALUES ($1, $2)", [
      str,
      JSON.stringify(json.embedding),
    ]);
  } catch (error) {
    console.error(error);
  }
}
