<div class="app">
  <main id="container">
    <slot />
  </main>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100vw;
    height: 100vh;
    margin: 0 auto;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
  }
</style>
