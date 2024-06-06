<script>
  export let selected_arr = [];
  export let edges = [];
  export let categories_map = new Map();
  export let degrees = new Map();

  async function description(item) {
    const resp = await fetch(
      `/api/description?dir=${item.includes("&") ? item.replace("&", "%26") : item}`
    );

    return await resp.json();
  }
</script>

<div class="side">
  {#if selected_arr.length === 0}
    <div class="help">
      <code>CTRL+ALT+D</code>
      <p class="hint">(show / hide) degree distribution</p>

      <code>ALT+P</code>
      <p class="hint">(show / hide) search bar</p>

      <code>ESC</code>
      <p class="hint">hide search bar</p>
      <code>ESC</code>
      <p class="hint">reset graph</p>

      <code>LMB</code>
      <p class="hint">(show / hide) node info</p>
      <code>LMB+SHIFT</code>
      <p class="hint">set node as graph root</p>

      <code>MWheel U/D</code>
      <p class="hint">scale the graph</p>

      <code>LMB (drag)</code>
      <p class="hint">(on empty space) pan the graph</p>

      <code>LMB (drag)</code>
      <p class="hint">(on node) drag the node</p>

      <p class="no-key">select 2 nodes to show edges</p>
      <p class="no-key">filter nodes by degree by changing value</p>
      <p class="no-key">filter nodes by category</p>
    </div>
  {/if}

  {#if selected_arr.length !== 0}
    <p class="sticky">Nodes</p>
    {#each selected_arr as item}
      <p class="node">{item}</p>
      <p class="node">Degree: {degrees.get(item)}</p>

      {#if categories_map.has(item)}
        {#each categories_map.get(item) as category}
          <p class="category">{category.text}</p>
        {/each}
      {/if}

      {#if selected_arr.length === 1}
        {#await description(item)}
          <p class="node">Loading...</p>
        {:then data}
          <p class="node">{data}</p>
        {/await}
      {/if}
    {/each}
  {/if}

  {#if edges.length !== 0}
    <p class="sticky">Edges</p>
    {#each edges as edge}
      <p class="link">{edge}</p>
    {/each}
  {/if}
</div>

<style>
  div.help {
    height: 100%;

    display: grid;
    grid-template-columns: auto auto;
    align-content: center;
    align-items: center;
    gap: 7px 10px;

    font-size: 0.7rem;
    color: rgb(98, 98, 98);
  }

  code {
    width: fit-content;
    padding: 0.5rem;
    border-radius: 5px;

    color: white;
    font-family: courier;
    font-weight: 600;
    border: 1px solid #606060;
  }

  .no-key {
    margin: 0;
    grid-column: 1 / 3;
    text-align: justify;
  }

  div.side {
    padding-left: 10px;
    grid-column: 1 / 2;
    grid-row: 1 / 3;

    box-sizing: border-box;
    overflow: scroll;

    border: 1px solid #606060;
    background: rgb(30, 30, 30);

    color: white;
    font-size: 1rem;
    font-family: sans-serif;

    margin: 0;
    position: relative;
  }

  .sticky {
    text-transform: uppercase;
    background-color: rgb(30, 30, 30);
    position: sticky;
    top: 0;
  }

  .category {
    text-align: end;
  }

  .side::-webkit-scrollbar {
    width: 10px;
  }

  .side::-webkit-scrollbar-thumb {
    background: #606060;
  }

  .side::-webkit-scrollbar-track {
    background: rgb(30, 30, 30);
  }

  .side::-webkit-scrollbar-thumb:hover {
    background: #505050;
  }

  .side::-webkit-scrollbar-corner {
    background: rgb(30, 30, 30);
  }

  .side::-webkit-scrollbar-button {
    display: none;
  }

  .side::-webkit-scrollbar-track-piece {
    background: rgb(30, 30, 30);
  }
</style>
