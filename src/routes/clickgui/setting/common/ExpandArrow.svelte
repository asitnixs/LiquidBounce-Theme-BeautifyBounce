<script lang="ts">
    import {createEventDispatcher} from "svelte";

    export let expanded: boolean;
    const dispatch = createEventDispatcher();

    function handleClick() {
        expanded = !expanded;
        dispatch("click");
    }
</script>

<button class="arrow-btn" class:expanded on:click={handleClick} aria-label="Expand">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
</button>

<style lang="scss">
  .arrow-btn {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--clickgui-text-dimmed-color);
    transition: transform 0.4s ease, color 0.4s ease;

    &.expanded {
      transform: rotate(-180deg);
    }

    &:hover {
      color: var(--clickgui-text-color);
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }
</style>