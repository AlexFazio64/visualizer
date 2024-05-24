<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let set = new Set();
  //   export let value = 0;

  //   function handleInput(event) {
  //     value = event.target.value;
  //   }

  $: set = Array.from(set).sort();
</script>

<nav>
  <section>
    <span></span>
    {#each set as category}
      <button title={category}>{category}</button>
    {/each}
    <span></span>
  </section>

  <!-- <input type="range" min="0" max="100" {value} on:input={handleInput} /> -->

  <button
    class="clear"
    on:click={() => {
      dispatch("clear");
    }}>Clear</button
  >
</nav>

<style>
  nav {
    display: grid;
    grid-template-columns: 1fr auto auto;

    grid-column: 2 / 3;
    position: relative;
  }

  section {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    gap: 0.5rem;

    border: 1px solid #606060;

    overflow-x: auto;
    white-space: nowrap;
  }

  section button {
    min-width: 125px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .clear {
    width: 80px;
    font-size: 1rem;
    align-self: center;
    background-color: hsl(0, 68%, 38%);
  }

  button {
    border: none;
    background-color: hsl(0, 44%, 38%);
    color: white;
    text-transform: uppercase;
    font-size: 0.7rem;
    padding: 0.5rem;
    cursor: pointer;

    white-space: nowrap;
  }

  nav::before,
  nav::after {
    content: "";
    width: 60px;
    height: 100%;
    position: absolute;
    pointer-events: none;
  }

  nav::before {
    left: 0;
    background: linear-gradient(
      to right,
      rgba(24, 26, 27, 1) 10%,
      rgba(24, 26, 27, 0) 100%
    );
  }

  nav::after {
    right: 80px;
    background: linear-gradient(
      to left,
      rgba(24, 26, 27, 1) 10%,
      rgba(24, 26, 27, 0) 100%
    );
  }

  section::-webkit-scrollbar {
    display: none;
  }
</style>
