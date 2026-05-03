<script lang="ts">
    import Header from "./header/Header.svelte";
    import {fly} from "svelte/transition";
    import {onMount} from "svelte";

    const transitionDuration = 700; // TODO: suboptimal

    let ready = false;

    onMount(() => {
        setTimeout(() => {
            ready = true;
        }, transitionDuration);
    });
</script>

<div class="bg-image"></div>
<div class="bg-overlay"></div>

<div class="menu">
    {#if ready}
        <div transition:fly|global={{duration: 700, y: -100}}>
            <Header/>
        </div>

        <div class="menu-wrapper">
            <slot/>
        </div>
    {/if}
</div>

<style lang="scss">
  .bg-image {
      position: fixed;
      inset: 0;
      background: url('backgrounds/background.png') center / cover no-repeat;
      transform: scale(1.04);
      z-index: -2;
  }

  .bg-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(6px);
      z-index: -1;
  }

  .menu {
    padding: 40px;
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .menu-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    will-change: transform;
  }

  @media screen and (max-width: 1366px) {
    .menu {
      zoom: 0.8;
      height: 125vh;
    }
  }

  @media screen and (max-width: 1200px) {
    .menu {
      zoom: 0.5;
      height: 200vh;
    }
  }

  @media screen and (max-height: 1100px) {
    .menu {
      zoom: 0.8;
      height: 125vh;
    }
  }

  @media screen and (max-height: 700px) {
    .menu {
      zoom: 0.5;
      height: 200vh;
    }
  }

  @media screen and (max-height: 540px) {
    .menu {
      zoom: 0.4;
      height: 250vh;
    }
  }
</style>
