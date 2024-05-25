export function make_links(wiki_nodes, url_to_dir, wiki_links) {
  let wiki_links_map = new Map();
  let duplicates = 0;

  for (let node of wiki_nodes)
    for (let key in node) {
      if (
        !node.hasOwnProperty(key) ||
        typeof node[key] !== "object" ||
        !node[key].link
      )
        continue;

      const links = node[key].link;
      for (let link of links)
        if (node.id && url_to_dir.get(link)) {
          const link_id = `${node.id}-${url_to_dir.get(link)}`;
          if (!wiki_links_map.has(link_id)) {
            wiki_links_map.set(link_id, true);
            wiki_links.push({
              source: node.id,
              target: url_to_dir.get(link),
            });
          } else {
            duplicates++;
          }
        }
    }
}

export function make_nodes(wiki_nodes, url_to_dir, files) {
  const promises = [];
  for (const file of files) {
    const promise = fetch(
      `/api/node?dir=${file.includes("&") ? file.replace("&", "%26") : file}`
    )
      .then((response) => response.json())
      .then((data) => {
        wiki_nodes.push(data);
        url_to_dir.set(data.url, data.id);
      });
    promises.push(promise);
  }
  return Promise.all(promises);
}

export async function getCategories() {
  let categories = await fetch("/api/categories").then((response) =>
    response.json()
  );

  categories = new Map(
    categories.map((category) => [category.id, category.categories])
  );
  return categories;
}

export function getDegrees(nodes, links) {
  const degrees = new Map();

  for (let node of nodes) {
    degrees.set(node.id, 0);
    for (let link of links) {
      if (link.source === node.id || link.target === node.id) {
        if (degrees.has(node.id)) {
          degrees.set(node.id, degrees.get(node.id) + 1);
        }
      }
    }
  }

  return degrees;
}

export function degrees(map) {
  let max = 0;
  let min = 0;

  for (let value of map.values()) {
    if (value > max) max = value;
    if (value < min) min = value;
  }

  return { max, min };
}

export function getEdges(id1, id2, nodes, url_id) {
  let node1 = null;
  let node2 = null;
  for (let node of nodes) {
    if (node.id === id1) node1 = node;
    if (node.id === id2) node2 = node;

    if (node1 && node2) break;
  }

  function getInfo(node, other, map) {
    const text = [];
    for (let key in node) {
      if (
        !node.hasOwnProperty(key) ||
        typeof node[key] !== "object" ||
        !node[key] ||
        !node[key].link
      )
        continue;

      const links = node[key].link;

      for (let link of links) {
        if (map.get(link) === other.id) {
          text.push(node[key].text);
        }
      }
    }
    return text;
  }

  let info = [];
  Array.prototype.push.apply(info, getInfo(node1, node2, url_id));
  Array.prototype.push.apply(info, getInfo(node2, node1, url_id));

  info = info.filter((text) => text.length > 0);

  return info;
}
