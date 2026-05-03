<script lang="ts">
    import { fly } from "svelte/transition";
    import { backOut } from "svelte/easing";
</script>

<div class="bottom-button-wrapper" transition:fly|global={{ y: 50, duration: 600, easing: backOut }}>
    <slot/>
</div>

<style lang="scss">
  .bottom-button-wrapper {
    position: fixed;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 20px;
    z-index: 100;
  }
</style>