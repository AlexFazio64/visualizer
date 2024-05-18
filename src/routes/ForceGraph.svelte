<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import * as graph from "./graph";

  let svg;

  const nodes = [];
  const links = [];
  const map = new Map();

  onMount(async () => {
    const files = await fetch("/api/files")
      .then((res) => res.json())
      .then((data) => {
        return data;
      });

    await graph.make_nodes(nodes, map, files);
    graph.make_links(nodes, map, links);

    graph.check(nodes, links, map);
    // return;

    const width = 1400;
    const height = 650;
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
      d3.select(this).attr("fill", "blue");
      g.append("text")
        .attr("transform", `translate(${initialTranslate})`)
        .attr("class", "label")
        .attr("x", d.x + 15)
        .attr("y", d.y)
        .text(d.id);
    }

    function hideLabel() {
      d3.select(this).attr("fill", "red");
      g.select(".label").remove();
    }

    // const linkLabel = svg
    //   .selectAll(".link-label")
    //   .data(links)
    //   .enter()
    //   .append("text")
    //   .attr("class", "link-label")
    //   .attr("text-anchor", "middle")
    //   .text((d) => `${d.source}-${d.target}`)
    //   .attr("dy", -5);

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
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      // linkLabel
      //   .attr("x", (d) => (d.source.x + d.target.x) / 2)
      //   .attr("y", (d) => (d.source.y + d.target.y) / 2);
    });

    const link = g
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("transform", `translate(${initialTranslate})`)
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.4);

    const node = g
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("transform", `translate(${initialTranslate})`)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("r", 10)
      .attr("fill", "red")
      .on("mouseover", showLabel)
      .on("mouseout", hideLabel)
      .call(drag(simulation));

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

<svg></svg>
<text class="label"></text>
<text class="link-label"></text>

<style>
  svg {
    background: rgb(30, 30, 30);
    border: 1px solid #606060;

    fill: white;
    font-size: 1rem;
    font-family: sans-serif;
  }

  .label {
    font-size: 1rem;
  }

  .link-label {
    font-size: 0.8rem;
  }
</style>
