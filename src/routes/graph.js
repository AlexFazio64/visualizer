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

export function assortativity_matrix(edges, categories, map) {
  const is_edge_from_to = ({ source, target }, cat1, cat2) => {
    return (
      map.get(source).filter(({ text }) => text === cat1).length > 0 &&
      map.get(target).filter(({ text }) => text === cat2).length > 0
    );
  };

  const total_edges = () => {
    let acc = 0;
    for (let { source, target } of edges)
      acc += map.get(source).length * map.get(target).length;

    return acc;
  };

  let matrix = new Map();

  for (let cat of categories) {
    matrix.set(cat, []);

    for (let cat2 of categories) {
      let a_i = 0;
      for (let l2 of edges) if (is_edge_from_to(l2, cat, cat2)) a_i++;

      a_i /= total_edges();
      matrix.get(cat).push({ category: cat2, value: a_i });
    }
  }

  let tot = 0;
  let i = 0;
  for (let cat1 of categories) {
    let a = [];
    for (let row of matrix.get(cat1)) a.push(row.value);
    for (let { value } of matrix.get(cat1)) tot += value;

    console.log(
      "a_" + ++i,
      a.reduce((acc, val) => acc + val, 0)
    );
  }

  console.log(tot);

  // compute assortativity mixing
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
