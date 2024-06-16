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

export function assortativity(e, d) {
  let A = 0;
  for (let { source, target } of e) A += d.get(source) * d.get(target);

  A /= e.length;
  const variance = 0.5 * A ** 2;

  let B = 0;
  for (let { source, target } of e)
    B += Math.pow(d.get(source), 2) * Math.pow(d.get(target), 2);
  B /= e.length * 2;

  return (A - variance) / (B - variance);
}

export function save(name, data) {
  fetch("/api/store", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: JSON.stringify(data), name }),
  });
}
