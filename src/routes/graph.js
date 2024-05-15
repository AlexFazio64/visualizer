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

export function check(wiki_nodes, wiki_links, map) {
  const invalid_links = new Set();

  // search for node in links
  // for (const link of wiki_links) {
  //   if (link.source === "07734") console.log(link, "s");
  //   if (link.target === "07734") console.log(link, "t");
  // }

  for (const link of wiki_links) {
    let found_source = false;
    for (const node of wiki_nodes) {
      if (node.id === link.source) {
        found_source = true;
        break;
      }
    }
    if (!found_source) {
      invalid_links.add(`${link.source} [s]`);
      console.log(link);
    }

    // search for target in nodes array
    let found_target = false;
    for (const node of wiki_nodes) {
      if (node.id === link.target) {
        found_target = true;
        break;
      }
    }
    if (!found_target) {
      invalid_links.add(`${link.target} [t]`);
      console.log(link);
    }
  }

  // sort alphabetically and print
  const invalid_links_array = Array.from(invalid_links);
  invalid_links_array.sort();
  for (const link of invalid_links_array) console.log(link);
}
