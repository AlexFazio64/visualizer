<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import * as graph from "./graph";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  export let toggle = false;

  $: if (toggle) {
    clear();
    toggle = false;
    dispatch("cleared");
  }

  $: if (selected_arr) {
    if (selected_arr.length === 2)
      edges = graph.getEdges(
        selected_arr[0].__data__.id,
        selected_arr[1].__data__.id,
        nodes,
        url_id
      );
    else edges = [];
    dispatch("selection", {
      arr: selected_arr.map((d) => d.__data__.id),
      edges: edges,
    });
  }

  $: if (selected) info.root = selected.__data__.id;
  $: if (selected === null) info.root = "";

  let svg;
  let edges = [];
  let selected = null;
  let selected_arr = [];
  let categories = null;
  let info = { root: "", hovered: "" };

  const width = 1200;
  const height = 590;
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  function highlight(c, highlight = true) {
    const node_color = color(degrees.get(c.__data__.id));
    c.attributes.getNamedItem("r").value = highlight ? 15 : 10;
    c.attributes.getNamedItem("fill").value = highlight ? "red" : node_color;
    c.attributes.getNamedItem("stroke-width").value = highlight ? 3 : 1;
    c.attributes.getNamedItem("stroke").value = highlight ? "#1e1e1e" : "#fff";
  }

  const nodes = [];
  const links = [];
  let degrees = new Map();
  const url_id = new Map();

  onMount(async () => {
    const files = await fetch("/api/files")
      .then((res) => res.json())
      .then((data) => {
        return data;
      });

    await graph.make_nodes(nodes, url_id, files);
    graph.make_links(nodes, url_id, links);
    degrees = graph.getDegrees(nodes, links);
    dispatch("degrees", { degrees });

    categories = await graph.getCategories(nodes);
    dispatch("categories", { categories });

    const initialTranslate = [width / 2, height / 2];

    function zoomed({ transform }) {
      g.attr("transform", transform);
    }

    const zoom = d3.zoom().scaleExtent([0.01, 20]).on("zoom", zoomed);

    svg = d3.select("svg").call(zoom);

    const g = svg.append("g");

    function mouseover(_event, d) {
      if (!selected || (selected && selected.__data__.id !== d.id))
        d3.select(this).attr("fill", "blue");
      info.hovered = d.id;
    }

    function mouseout() {
      if (
        !selected ||
        (selected && selected.__data__.id !== d3.select(this).data()[0].id)
      )
        d3.select(this).attr("fill", (d) => color(degrees.get(d.id)));
      info.hovered = "";
    }

    function updateGraph() {
      let filteredLinks;

      if (selected === null || selected === undefined) {
        filteredLinks = links;
      } else {
        filteredLinks = links.filter(
          (d) =>
            d.source.id === selected.__data__.id ||
            d.target.id === selected.__data__.id
        );
      }

      // Get the ids of nodes connected to the selected node
      const connectedNodeIds = new Set(
        filteredLinks.flatMap((d) => [d.source.id, d.target.id])
      );

      // Filter nodes based on the connectedNodeIds
      let filteredNodes = nodes.filter((d) => connectedNodeIds.has(d.id));

      if (selected === null) {
        filteredNodes = nodes;
      } else if (connectedNodeIds.size === 0) {
        filteredNodes = nodes.filter((d) => d.id === selected.__data__.id);
      }

      // Update links
      const linkSelection = g
        .selectAll("line")
        .data(filteredLinks, (d) => `${d.source.id}-${d.target.id}`);
      linkSelection.exit().remove();
      linkSelection
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.4)
        .merge(linkSelection)
        .attr("transform", `translate(${initialTranslate})`)
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      // Update nodes
      const nodeSelection = g
        .selectAll("circle")
        .data(filteredNodes, (d) => d.id);
      nodeSelection.exit().remove();
      nodeSelection
        .enter()
        .append("circle")
        .attr("transform", `translate(${initialTranslate})`)
        .attr("r", 10)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .attr("fill", (d) => color(degrees.get(d.id)))
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("click", click)
        .merge(nodeSelection)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .call(drag(simulation));

      g.selectAll("circle").raise();
    }

    function click(_event) {
      const circle = d3.select(this)._groups[0][0];

      if (_event.shiftKey) {
        if (selected) {
          highlight(selected, false);
          if (selected.__data__.id !== circle.__data__.id) {
            selected = circle;
            highlight(selected);
          } else selected = null;
        } else {
          selected = circle;
          highlight(selected);
        }

        updateGraph();
      } else {
        selected_arr.find((d) => d.__data__.id === circle.__data__.id)
          ? selected_arr.splice(selected_arr.indexOf(circle), 1) &&
            highlight(circle, false)
          : selected_arr.push(circle) && highlight(circle);

        selected_arr = [...new Set(selected_arr)];
        if (selected) highlight(selected);
      }
    }

    const simulation = d3
      .forceSimulation(nodes)
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .force("charge", d3.forceManyBody().strength(-1000))
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(200)
      );

    simulation.on("tick", () => {
      g.selectAll("line")
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      g.selectAll("circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
    });

    updateGraph();

    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  });

  function clear() {
    if (selected) {
      highlight(selected, false);
      selected.dispatchEvent(new MouseEvent("click", { shiftKey: true }));
    }

    for (const node of selected_arr) {
      highlight(node, false);
    }
    selected_arr = [];
  }
</script>

<section>
  <span>
    <p>Root:</p>
    <p class="root">
      {info.root}
    </p>
    <p>Hovered:</p>
    <p class="hover">
      {info.hovered}
    </p>
  </span>
  <svg></svg>
</section>

<style>
  span {
    width: 100%;
    max-width: 100%;
    display: grid;
    grid-template-columns: repeat(2, auto 3fr);
    gap: 0.5em;
    justify-items: center;
    align-content: center;
  }

  span p {
    color: white;
    font-size: 1em;
    font-family: sans-serif;

    max-width: 500px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p:nth-child(odd) {
    text-decoration: underline;
    font-weight: bold;
  }

  section {
    grid-row: 2 / 3;
    grid-column: 2 / 3;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
  }

  .root {
    color: red;
  }

  .hover {
    color: cornflowerblue;
  }

  svg {
    background: rgb(30, 30, 30);
    border: 1px solid #606060;

    fill: white;
    font-size: 1rem;
    font-family: sans-serif;

    height: 100%;
    width: 100%;
    box-sizing: border-box;
  }
</style>
