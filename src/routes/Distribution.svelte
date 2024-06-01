<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";

  export let degrees = new Map();
  export let categories_map = new Map();
  export let dist_filter = undefined;

  let _x = -1;
  let _y = -1;

  $: if (dist_filter) {
    plot(degrees);
  }

  $: if (dist_filter === undefined) {
    plot(degrees);
  }

  function plot(data) {
    let filtered = new Map();

    if (dist_filter) {
      for (const degree of data.keys()) {
        if (!categories_map.get(degree).find((v) => v.text == dist_filter))
          continue;
        filtered.set(degree, data.get(degree));
      }
    } else {
      filtered = data;
    }

    const degreeCounts = {};
    for (const degree of filtered.values()) {
      degreeCounts[degree] = (degreeCounts[degree] || 0) + 1;
    }

    const degrees = Object.keys(degreeCounts).map(Number);
    const counts = Object.values(degreeCounts);

    const svg = d3.select("svg"),
      margin = { top: 30, right: 20, bottom: 30, left: 60 };

    let width, height;

    try {
      svg.attr("width");
      width = +svg.attr("width") - margin.left - margin.right;
      height = +svg.attr("height") - margin.top - margin.bottom;
    } catch (error) {
      console.error("oops");
      return;
    }

    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(degrees)
      .rangeRound([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(counts)])
      .nice()
      .rangeRound([height, 0]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat((d) => d));

    g.append("g")
      .call(d3.axisLeft(y).ticks(10, "d"))
      .append("text")
      .attr("class", "axis-label")
      .attr("fill", "white")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Count");

    g.selectAll(".bar")
      .data(degrees)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d))
      .attr("y", (d) => y(degreeCounts[d]))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(degreeCounts[d]))
      .on("mouseover", function (d) {
        d3.select(this).attr("fill", "steelblue");
        _x = d.srcElement.__data__;
        _y = degreeCounts[d.srcElement.__data__];
      })
      .on("mouseout", function (_d) {
        d3.select(this).attr("fill", "white");
        _x = -1;
        _y = -1;
      });
  }

  onMount(() => {
    plot(degrees);
  });
</script>

<section>
  <span>
    <p>Degree Distribution</p>
    <p>{_x >= 0 ? "Degree: " + _x : ""}</p>
    <p>{_y >= 0 ? "#Nodes: " + _y : ""}</p>
  </span>
  <svg width="1200" height="590"></svg>
</section>
<text class="bar axis-label"></text>

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

  svg {
    background: rgb(30, 30, 30);
    border: 1px solid #606060;

    fill: white;
    color: white;
    font-size: 1rem;
    font-family: sans-serif;

    height: 100%;
    width: 100%;
    box-sizing: border-box;
  }

  section {
    grid-row: 2 / 3;
    grid-column: 2 / 3;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
  }

  .bar {
    fill: steelblue;
  }
  .bar:hover {
    fill: orange;
  }
  .axis-label {
    font-size: 12px;
  }
</style>
