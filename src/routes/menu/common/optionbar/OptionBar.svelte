<script lang="ts">
    import {fly} from "svelte/transition";
</script>

<div class="option-bar" transition:fly|global={{duration: 700, x: 1000}}>
    <slot />
</div>

<style lang="scss">
    .option-bar {
      background: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
      padding: 12px 18px;
      display: flex;
      border-radius: 14px;
      align-items: center;
      column-gap: 20px;
      margin-bottom: 10px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
</style>