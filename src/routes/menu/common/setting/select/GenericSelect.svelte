<script lang="ts">
    import {quintOut} from "svelte/easing";
    import {fade, slide} from "svelte/transition";

    export let closeOnInternalClick: boolean;

    let expanded = false;
    let selectElement: HTMLElement;
    let headerElement: HTMLElement;

    function handleWindowClick(e: MouseEvent) {
        if (selectElement && !selectElement.contains(e.target as Node)) {
            expanded = false;
        }
    }

    function handleSelectClick(e:MouseEvent) {
        if (closeOnInternalClick) {
            expanded = !expanded;
        } else {
            if (!expanded) {
                expanded = true;
            } else {
                expanded = !headerElement.contains(e.target as Node);
            }
        }
    }
</script>

<svelte:window on:click={handleWindowClick}/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="select" class:expanded bind:this={selectElement} on:click={handleSelectClick}>
    <div class="header" bind:this={headerElement}>
        <span class="title">
            <slot name="title"/>
        </span>
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    </div>
    {#if expanded}
        <div class="options-wrapper" transition:slide|global={{ duration: 200, easing: quintOut }}>
            <div class="options">
                <slot name="options"></slot>
            </div>
        </div>
    {/if}
</div>

<style lang="scss">
  .select {
    cursor: pointer;
    min-width: 250px;
    position: relative;
    user-select: none;
  }

  .header {
    background: var(--clickgui-base-color);
    border: 1px solid var(--clickgui-border-color);
    padding: 20px;
    display: flex;
    column-gap: 20px;
    align-items: center;
    justify-content: space-between;
    border-radius: 12px;
    transition: all 0.4s ease;

    &:hover {
        background: var(--clickgui-window-background-color);
    }

    .title {
      color: var(--clickgui-text-color);
      font-size: 16px;
      font-weight: 500;
    }

    .chevron {
        width: 18px;
        height: 18px;
        color: var(--clickgui-text-dimmed-color);
        transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
  }

  .expanded .header {
    border-color: var(--accent-color);
    
    .chevron {
        transform: rotate(-180deg);
    }
  }

  .options-wrapper {
    position: absolute;
    z-index: 1000;
    width: 100%;
    top: calc(100% + 6px);
  }

  .options {
    background: var(--clickgui-base-color);
    border: 1px solid var(--clickgui-border-color);
    border-radius: 14px;
    max-height: 300px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding: 6px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: var(--accent-color); border-radius: 8px; }
  }
</style>