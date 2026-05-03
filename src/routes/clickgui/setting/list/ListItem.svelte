<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import {itemTextureUrl} from "../../../../integration/rest";

    const dispatch = createEventDispatcher<{
        toggle: { value: string, enabled: boolean }
    }>();

    export let value: string;
    export let name: string;
    export let icon: string | undefined;
    export let enabled: boolean;

    let showingFallbackImage = false;

    function showFallbackIcon(event: Event) {
        const img = event.currentTarget as HTMLImageElement;
        showingFallbackImage = true;
        img.src = itemTextureUrl("minecraft:grass_block");
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="item" class:enabled on:click={() => dispatch("toggle", {enabled: !enabled, value:value})}>

    {#if icon}
        <img class="mc-icon" class:fallback={showingFallbackImage} src="{icon}" alt={value} on:error={showFallbackIcon}/>
    {/if}

    <div class="check-icon">
        {#if enabled}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        {/if}
    </div>
    
    <div class="name">{name}</div>

</div>

<style lang="scss">
  .item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background 0.4s ease;
    border-radius: 8px;

    &:hover { 
      background: var(--clickgui-window-background-color); 
    }
  }

  .check-icon {
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    svg {
      width: 14px;
      height: 14px;
      color: var(--clickgui-text-color);
    }
  }

  .mc-icon {
    height: 20px;
    width: 20px;
    image-rendering: pixelated;
    flex-shrink: 0;

    &.fallback { 
      filter: grayscale(1); 
      opacity: 0.4; 
    }
  }

  .name {
    flex: 1;
    font-size: 14px;
    font-weight: 400;
    color: var(--clickgui-text-dimmed-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.4s ease;
  }

  .item.enabled .name {
    color: var(--clickgui-text-color);
  }
</style>