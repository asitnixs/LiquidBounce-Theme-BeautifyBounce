<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import GenericSelect from "./GenericSelect.svelte";

    export let options: string[];
    export let values: string[];
    export let title: string;

    const dispatch = createEventDispatcher<{
        change: { values: string[] }
    }>();

    function handleOptionClick(o: string) {
        if (values.includes(o)) {
            values = values.filter(v => v !== o);
        } else {
            values = [...values, o]
        }
        dispatch("change", {values});
    }
</script>

<GenericSelect closeOnInternalClick={false}>
    <span slot="title" class="title">{title}</span>

    <svelte:fragment slot="options">
        {#each options as o}
            <div on:click={() => handleOptionClick(o)} class="option" class:active={values.includes(o)}>
                <div class="checkbox">
                    {#if values.includes(o)}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    {/if}
                </div>
                <span>{o}</span>
            </div>
        {/each}
    </svelte:fragment>
</GenericSelect>

<style lang="scss">
  .title {
      font-weight: 500;
  }

  .option {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
    color: var(--clickgui-text-dimmed-color);
    font-size: 16px;
    padding: 8px 12px;
    border-radius: 10px;
    transition: all 0.4s ease;
    cursor: pointer;

    &:hover {
      background: color-mix(in srgb, var(--accent-color) 20%, transparent);
      color: var(--clickgui-text-color);
    }

    &.active {
      color: var(--clickgui-text-color);
    }
  }

  .checkbox {
      width: 18px;
      height: 18px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.4s;

      svg {
          width: 14px;
          height: 14px;
          color: var(--clickgui-text-color);
      }
  }
</style>