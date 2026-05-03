<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import {slide} from "svelte/transition";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../../theme/theme_config";

    export let name: string | null;
    export let options: string[];
    export let value: string;

    const dispatch = createEventDispatcher();

    let expanded = false;
    let dropdownHead: HTMLElement;

    function windowClickHide(e: MouseEvent) {
        if (dropdownHead && !dropdownHead.contains(e.target as Node)) {
            expanded = false;
        }
    }

    function updateValue(v: string) {
        value = v;
        expanded = false;
        dispatch("change");
    }
</script>

<svelte:window on:click={windowClickHide}/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="dropdown-container">
    {#if name !== null}
        <div class="dropdown-label">
            {$spaceSeperatedNames ? convertToSpacedString(name) : name}
        </div>
    {/if}

    <div class="dropdown-wrapper" bind:this={dropdownHead}>
        <div class="trigger" class:expanded on:click={() => (expanded = !expanded)}>
            <span class="val">{$spaceSeperatedNames ? convertToSpacedString(value) : value}</span>
            <svg class="chevron" class:expanded viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        </div>

        {#if expanded}
            <div class="options" transition:slide={{ duration: 150 }}>
                {#each options as o (o)}
                    <div
                        class="option"
                        class:active={o === value}
                        on:click={() => updateValue(o)}
                    >
                        {$spaceSeperatedNames ? convertToSpacedString(o) : o}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
  .dropdown-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 10px;
    padding: 2px 0;
  }

  .dropdown-label {
    font-weight: 500;
    color: var(--clickgui-text-color);
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dropdown-wrapper {
    position: relative;
    min-width: 100px;
    flex-shrink: 0;
  }

  .trigger {
    background: var(--clickgui-window-background-color);
    border: 1px solid var(--clickgui-border-color);
    padding: 4px 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    gap: 10px;
    transition: all 0.4s ease;

    &:hover {
      border-color: color-mix(in srgb, var(--accent-color) 40%, transparent);
    }

    &.expanded {
      border-color: var(--accent-color);
      background: color-mix(in srgb, var(--accent-color) 20%, transparent);
    }
  }

  .val {
    font-size: 12px;
    font-weight: 600;
    color: var(--clickgui-text-color);
    white-space: nowrap;
  }

  .chevron {
    width: 14px;
    height: 14px;
    color: var(--clickgui-text-dimmed-color);
    transition: transform 0.4s ease, color 0.4s;

    &.expanded {
      transform: rotate(-180deg);
      color: var(--accent-color);
    }
  }

  .options {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 100%;
    width: max-content;
    background: var(--clickgui-window-background-color);
    border: 1px solid var(--clickgui-border-color);
    border-radius: 8px;
    padding: 4px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 300px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .option {
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 400;
    color: var(--clickgui-dropdown-option-color);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.4s;
    white-space: nowrap;

    &:hover {
      background: var(--clickgui-base-color);
      color: var(--clickgui-dropdown-option-hover-color);
    }

    &.active {
      background: color-mix(in srgb, var(--accent-color) 20%, transparent);
      color: var(--clickgui-text-color);
      font-weight: 600;
    }
  }
</style>