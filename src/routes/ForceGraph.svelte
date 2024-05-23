<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import * as graph from "./graph";

  let svg;

  let selected = null;
  let selected_arr = [];
  let edges = [];
  const width = 1400;
  const height = 650;
  let categories;

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  function highlight(circle, highlight = true) {
    if (highlight) {
      d3.select(circle)
        .attr("fill", "white")
        .attr("r", 15)
        .attr("stroke-width", 2)
        .attr("stroke", (d) => color(degrees.get(d.id)));
    } else {
      d3.select(circle)
        .attr("fill", (d) => color(degrees.get(d.id)))
        .attr("r", 10)
        .attr("stroke-width", 1)
        .attr("stroke", "white");
    }
  }

  const nodes = [];
  const links = [];
  let degrees = new Map();
  const map = new Map();

  onMount(async () => {
    const files = await fetch("/api/files")
      .then((res) => res.json())
      .then((data) => {
        return data;
      });

    await graph.make_nodes(nodes, map, files);
    graph.make_links(nodes, map, links);
    degrees = graph.getDegrees(nodes, links);
    categories = await graph.getCategories(nodes);
    const initialTranslate = [width / 2, height / 2];

    function zoomed({ transform }) {
      g.attr("transform", transform);
    }

    const zoom = d3.zoom().scaleExtent([0.01, 20]).on("zoom", zoomed);

    svg = d3
      .select("svg")
      .attr("width", width)
      .attr("height", height)
      .call(zoom);

    const g = svg
      .append("g")
      .attr("transform", `translate(${initialTranslate})`);

    function showLabel(_event, d) {
      if (selected !== d.id) d3.select(this).attr("fill", "blue");
      g.append("text")
        .attr("transform", `translate(${initialTranslate})`)
        .attr("class", "label")
        .attr("x", d.x + 15)
        .attr("y", d.y)
        .text(d.id);
    }

    function hideLabel() {
      if (selected !== d3.select(this).data()[0].id)
        d3.select(this).attr("fill", (d) => color(degrees.get(d.id)));
      g.select(".label").remove();
    }

    function updateGraph() {
      // Filter links based on the selected node
      let filteredLinks = links.filter(
        (d) => d.source.id === selected || d.target.id === selected
      );

      if (selected === null) {
        filteredLinks = links;
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
        filteredNodes = nodes.filter((d) => d.id === selected);
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
        .on("mouseover", showLabel)
        .on("mouseout", hideLabel)
        .on("click", stats)
        .merge(nodeSelection)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .call(drag(simulation));

      g.selectAll("circle").raise();
    }

    async function stats(_event) {
      const d = d3.select(this).data()[0];

      if (_event.shiftKey) {
        if (selected_arr.includes(d.id)) {
          selected_arr = selected_arr.filter((id) => id !== d.id);
          highlight(this, false);
        } else {
          selected_arr = [...selected_arr, d.id];
          highlight(this);
        }

        if (selected_arr.length === 2) {
          const [id1, id2] = selected_arr;
          edges = await graph.getStats(id1, id2, nodes, links, map);
        } else {
          edges = [];
        }

        return;
      }

      if (selected === d.id) {
        selected = null;
        highlight(this, false);
      } else if (selected === null) {
        selected = d.id;
        highlight(this);
      }

      updateGraph();
    }

    const simulation = d3
      .forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("x", d3.forceX())
      .force("y", d3.forceY())
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

    // Initialize links and nodes
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
</script>

<ul>
  {#if selected_arr.length === 2}
    {#each selected_arr as node}
      <li>{node}</li>
      <ol>
        {#each categories.get(node) as category}
          <li>{category.text}</li>
        {/each}
      </ol>
    {/each}
    {#each edges as edge}
      <li>{edge}</li>
    {/each}
  {/if}
</ul>

<div>
  <button
    on:click={() => {
      d3.selectAll("circle")._groups[0].forEach((circle) => {
        if (circle.attributes.getNamedItem("r").value === "15") {
          circle.dispatchEvent(new MouseEvent("click"));
        }
      });

      selected_arr.forEach((id) => {
        d3.selectAll("circle")._groups[0].forEach((circle) => {
          if (circle.__data__.id === id) {
            circle.dispatchEvent(new MouseEvent("click", { shiftKey: true }));
          }
        });
      });

      selected_arr = [];
    }}>Clear</button
  >
  <svg></svg>
</div>
<text class="label"></text>

<style>
  div {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    flex-direction: column;
    gap: 0.5rem;
  }
  svg {
    background: rgb(30, 30, 30);
    border: 1px solid #606060;

    fill: white;
    font-size: 1rem;
    font-family: sans-serif;
    box-sizing: border-box;
  }

  .label {
    font-size: 1rem;
  }

  ul {
    min-width: 200px;
    max-width: 300px;
    height: 100vh;
    position: absolute;

    margin: 0;
    box-sizing: border-box;

    top: 0;
    left: 0;
    overflow: scroll;

    border: 1px solid #606060;
    background: rgb(30, 30, 30);

    color: white;
    font-size: 1rem;
    font-family: sans-serif;
  }

  ul::-webkit-scrollbar {
    width: 10px;
  }

  ul::-webkit-scrollbar-thumb {
    background: #606060;
  }

  ul::-webkit-scrollbar-track {
    background: rgb(30, 30, 30);
  }

  ul::-webkit-scrollbar-thumb:hover {
    background: #505050;
  }

  ul::-webkit-scrollbar-corner {
    background: rgb(30, 30, 30);
  }

  ul::-webkit-scrollbar-button {
    display: none;
  }

  ul::-webkit-scrollbar-track-piece {
    background: rgb(30, 30, 30);
  }
</style>
