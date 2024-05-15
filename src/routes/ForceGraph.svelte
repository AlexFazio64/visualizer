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

    const width = 1800;
    const height = 1200;
    svg = d3.select("svg").attr("width", width).attr("height", height);

    function showLabel(_event, d) {
      d3.select(this).attr("fill", "blue");
      svg
        .append("text")
        .attr("class", "label")
        .attr("x", d.x + 15)
        .attr("y", d.y)
        .text(d.id);
    }

    function hideLabel() {
      d3.select(this).attr("fill", "red");
      svg.select(".label").remove();
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
      .force("charge", d3.forceManyBody().strength(-500))
      .force(
        "link",
        d3.forceLink(links).id((d) => d.id).distance(100)
      )
      .force("center", d3.forceCenter(width / 2, height / 2))

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

    const link = svg
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6);

    const node = svg
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
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
