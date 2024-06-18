<script>
  import { onMount } from "svelte";
  import { assortativity, assortativity_mixing } from "./graph";

  let edges = [];
  let nodes = [];
  let coefficient = 0;
  export let degrees = new Map();
  export let categories_map = new Map();
  export let categories_set = new Set();

  let E = new Map();
  let A = [];
  let R = 0;
  let cumsum = 0;

  onMount(async () => {
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
  });
</script>

<div>
  <h1>Assortativity Coefficient</h1>
  <p>{coefficient}</p>
  <h1>Discrete Assortativity Mixing</h1>
  <p>{R}</p>
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
</style>
