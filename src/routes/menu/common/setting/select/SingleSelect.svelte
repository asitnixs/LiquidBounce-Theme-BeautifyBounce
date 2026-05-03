<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import GenericSelect from "./GenericSelect.svelte";

    export let options: string[];
    export let value: string;
    export let title: string;

    const dispatch = createEventDispatcher<{
        change: { value: string }
    }>();

    function handleOptionClick(o: string) {
        value = o;
        dispatch("change", {value: o});
    }
</script>

<GenericSelect closeOnInternalClick={true}>
    <span slot="title"><span class="title">{title}:</span> <span class="val">{value}</span></span>

    <svelte:fragment slot="options">
        {#each options as o}
            <div on:click={() => handleOptionClick(o)} class="option" class:active={o === value}>
                {o}
            </div>
        {/each}
    </svelte:fragment>
</GenericSelect>

<style lang="scss">
  .title {
    font-weight: 500;
    color: var(--clickgui-text-dimmed-color);
    margin-right: 4px;
  }
  
  .val {
    font-weight: 500;
    color: var(--clickgui-text-color);
  }

  .option {
    font-weight: 400;
    color: var(--clickgui-text-dimmed-color);
    font-size: 16px;
    padding: 10px 14px;
    border-radius: 12px;
    transition: all 0.4s ease;
    cursor: pointer;
    margin-top: 4px;

    &:hover {
      background: color-mix(in srgb, var(--accent-color) 20%, transparent);
      color: var(--clickgui-text-color);
    }

    &.active {
      background: color-mix(in srgb, var(--accent-color) 40%, transparent);
      color: var(--accent-color);
      font-weight: 500;
    }
  }
</style>