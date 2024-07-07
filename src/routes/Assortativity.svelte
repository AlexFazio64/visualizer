<script>
  import { onMount } from "svelte";
  import {
    assortativity,
    assortativity_mixing,
    memoize_distances,
    save,
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
  });

  function set_node(e, source = true) {
    if (source) s = e.target.value;
    else t = e.target.value;
  }

  $: if (s != undefined && t != undefined) {
    console.log(s, t);
    if (distances != null) {
      console.log(distances[s][t]);
    }
  }
</script>

<div>
  <h1>Assortativity Coefficient</h1>
  <p>{coefficient}</p>
  <h1>Discrete Assortativity Mixing</h1>
  <p>{R}</p>
  <h1>Path</h1>
  <span class="path-node">
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
  </span>
  {#if s != undefined && t != undefined}
    <span class="path">
      {#if distances[s][t].length == 0}
        <p>No path found</p>
      {:else}
        <p>length: {distances[s][t].length}</p>
        {#each distances[s][t] as step}
          <p>{step}</p>
        {/each}
      {/if}
    </span>
  {/if}
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    font-family: sans-serif;
    color: white;
  }

  select {
    margin: 10px;
    padding: 5px;
    border: none;
    border-bottom: 1px solid white;
    background-color: transparent;
    color: white;
    text-align: center;
  }

  option {
    background-color: #181a1b;
  }

  .path-node {
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-content: center;
    align-items: center;
    width: min-content;
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
