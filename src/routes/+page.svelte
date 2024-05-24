<script>
  import ForceGraph from "./ForceGraph.svelte";
  import NavBar from "./NavBar.svelte";
  import SideBar from "./SideBar.svelte";

  // clear the graph
  let toggle = false;

  // show info on nodes
  let edges = [];
  let selected_arr = [];
  let categories = new Map();
  let set = new Set();
</script>

<main>
  <SideBar {selected_arr} {edges} {categories} />
  <NavBar
    {set}
    on:clear={() => {
      toggle = true;
    }}
  />
  <ForceGraph
    {toggle}
    on:cleared={() => {
      toggle = false;
    }}
    on:selection={(event) => {
      selected_arr = event.detail.arr;
      edges = event.detail.edges;
    }}
    on:categories={(event) => {
      let new_set = new Set();
      categories = event.detail.categories;
      
      categories.forEach((value) => {
        value.forEach((v) => {
          new_set.add(v.text);
        });
      });

      set = new_set;
    }}
  />
</main>

<style>
  main {
    display: grid;
    height: 100vh;
    width: 100vw;
    column-gap: 0.8rem;

    grid-template-rows: 50px auto;
    grid-template-columns: 1fr 4fr;
  }
</style>
