<script>
  import { onMount } from "svelte";
  import {
    assortativity,
    assortativity_mixing,
    graph_stats,
    // memoize_distances,
    // save,
  } from "./graph";

  let edges = [];
  let nodes = [];
  let coefficient = 0;
  export let degrees = new Map();
  export let categories_map = new Map();
  export let categories_set = new Set();

  let R = 0;
  let distances = null;
  let s, t;
  let stats = {};

  onMount(async () => {
    s = undefined;
    t = undefined;

    edges = await fetch(
      process.env.NODE_ENV === "development"
        ? "/links.json"
        : "/visualizer/links.json"
    )
      .then((res) => res.json())
      .then((data) => {
        return data;
      });

    nodes = await fetch(
      process.env.NODE_ENV === "development"
        ? "/nodes.json"
        : "/visualizer/nodes.json"
    )
      .then((res) => res.json())
      .then((data) => {
        return data;
      });

    coefficient = assortativity(edges, degrees);
    coefficient = Math.round(coefficient * 10000) / 10000;

    R = assortativity_mixing(edges, categories_set, categories_map).R;
    R = Math.round(R * 10000) / 10000;

    // memoize_distances(nodes, edges).then((res) => {
    //   distances = res;
    //   save("distances.json", distances);
    // });

    distances = await fetch(
      process.env.NODE_ENV === "development"
        ? "/distances.json"
        : "/visualizer/distances.json"
    )
      .then((res) => res.json())
      .then((data) => {
        return data;
      });

    stats = graph_stats(distances);
  });

  function set_node(e, source = true) {
    if (source) s = e.target.value;
    else t = e.target.value;
  }

  // $: if (s != undefined && t != undefined) {
  //   console.log(s, t);
  //   if (distances != null) {
  //     console.log(distances[s][t]);
  //   }
  // }
</script>

<div>
  <section>
    <h1>Assortativity Coefficient</h1>
    <p>{coefficient}</p>
    <h1>Discrete Assortativity Mixing</h1>
    <p>{R}</p>
    <h1>Graph Stats</h1>
    <p>Graph Diameter: {stats.diameter}</p>
    <p>Average Path length: {stats.avg}</p>
    <p>Isolated nodes: {stats.invalid}</p>
  </section>

  <section>
    <h1>Path</h1>
    <p>source</p>
    <select name="source" id="s" on:change={(e) => set_node(e)}>
      {#each nodes as node, i}
        <option value={i}>{node.id}</option>
      {/each}
    </select>

    <p>target</p>
    <select name="target" id="t" on:change={(e) => set_node(e, false)}>
      {#each nodes as node, i}
        <option value={i}>{node.id}</option>
      {/each}
    </select>
    {#if s != undefined && t != undefined}
      <p>length: {distances[s][t].length}</p>

      <span class="path">
        {#if distances[s][t].length == 0}
          <p>No path found</p>
        {:else}
          {#each distances[s][t] as step}
            <p>{step}</p>
          {/each}
        {/if}
      </span>
    {/if}
  </section>
</div>

<style>
  div {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    width: 100%;
    height: 100%;

    font-family: sans-serif;
    color: white;
  }

  section {
    display: flex;
    flex-direction: column;
  }

  select {
    width: 75%;
    margin: 10px;
    padding: 5px;
    border: none;
    border-bottom: 1px solid white;
    background-color: transparent;
    color: white;
    text-align: center;
    align-self: center;
  }

  option {
    background-color: #181a1b;
  }

  span.path {
    display: flex;
    flex-direction: column;
    align-items: center;

    overflow: auto;
    height: 100px;
  }

  span.path p {
    margin: 0;
  }

  span.path::-webkit-scrollbar {
    width: 10px;
  }

  span.path::-webkit-scrollbar-thumb {
    background-color: #888;
  }
</style>
