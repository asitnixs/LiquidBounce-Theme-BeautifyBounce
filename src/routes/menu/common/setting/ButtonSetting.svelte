<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import CircleLoader from "../CircleLoader.svelte";

    export let title: string;
    export let disabled = false;
    export let secondary = false;
    export let inset = false;
    export let listenForEnter = false;
    export let loading = false;

    const dispatch = createEventDispatcher();

    function handleKeyDown(e: KeyboardEvent) {
        if (!listenForEnter) return;
        if (e.key === "Enter") dispatch("click");
    }
</script>

<svelte:window on:keydown={handleKeyDown}/>
<button class="button-setting" class:inset type="button" on:click={() => dispatch("click")} {disabled} class:secondary>
    {#if loading}
        <CircleLoader/>
    {/if}
    {title}
</button>

<style lang="scss">
  .button-setting {
    position: relative;
    border: none;
    background-color: var(--accent-color);
    color: var(--clickgui-text-color);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    font-size: 16px;
    font-weight: 600;
    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;

    &.inset {
      margin: 0 20px;
    }

    &.secondary {
      background-color: var(--clickgui-window-background-color);
      color: var(--clickgui-text-color);
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }

    &:not([disabled]):hover {
      cursor: pointer;
      box-shadow: 0 8px 24px color-mix(in srgb, var(--accent-color) 40%, transparent);

      &.secondary {
        background-color: var(--accent-color);
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        filter: none;
      }
    }

    &[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }
  }
</style>