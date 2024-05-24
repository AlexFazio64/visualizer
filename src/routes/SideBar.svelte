<script>
  export let selected_arr = [];
  export let edges = [];
  export let categories = new Map();
</script>

<div>
  {#if selected_arr.length !== 0}
    <p class="sticky">Nodes</p>
    {#each selected_arr as item}
      <p class="node">{item}</p>
      {#if categories.has(item)}
        {#each categories.get(item) as category}
          <p class="category">{category.text}</p>
        {/each}
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
  div {
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

  div::-webkit-scrollbar {
    width: 10px;
  }

  div::-webkit-scrollbar-thumb {
    background: #606060;
  }

  div::-webkit-scrollbar-track {
    background: rgb(30, 30, 30);
  }

  div::-webkit-scrollbar-thumb:hover {
    background: #505050;
  }

  div::-webkit-scrollbar-corner {
    background: rgb(30, 30, 30);
  }

  div::-webkit-scrollbar-button {
    display: none;
  }

  div::-webkit-scrollbar-track-piece {
    background: rgb(30, 30, 30);
  }
</style>
