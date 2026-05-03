<script lang="ts">
    import {type ComponentType, createEventDispatcher} from "svelte";

    let availableTabsElement: HTMLElement | undefined;

    export let tabs: {
        title: string,
        icon: string,
        component: ComponentType,
    }[];
    export let activeTab = 0;

    const dispatch = createEventDispatcher<{
        changeTab: { activeTab: number }
    }>();

    function setActiveTab(i: number) {
        activeTab = i;
        dispatch("changeTab", {activeTab});
    }
</script>

<div class="tabs">
    <div class="available-tabs" bind:this={availableTabsElement}>
        {#each tabs as {title, icon}, index}
            <button class="tab-button" class:active={tabs[activeTab].title === title}
                    on:click={() => setActiveTab(index)}>
                <img class="icon" src="img/menu/altmanager/{icon}" alt={title}>
                <span>{title}</span>
            </button>
        {/each}
    </div>

    <div style="width: {availableTabsElement?.clientWidth}px">
        <svelte:component this={tabs[activeTab].component}/>
    </div>
</div>

<style lang="scss">
  .available-tabs {
    display: flex;
    background: var(--clickgui-window-background-color);
    padding: 6px;
    border-radius: 14px;
    margin-bottom: 20px;
  }

  .tab-button {
    background-color: transparent;
    color: var(--clickgui-text-dimmed-color);
    padding: 14px 10px;
    border: none;
    border-radius: 12px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 10px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    font-weight: 500;

    .icon {
      height: 24px;
    }

    &:hover:not(.active) {
      background-color: var(--clickgui-base-color);
      color: var(--clickgui-text-color);
    }

    &.active {
      background-color: color-mix(in srgb, var(--accent-color) 80%, transparent);
      color: var(--clickgui-text-color);
      box-shadow: 0 4px 16px color-mix(in srgb, var(--accent-color) 40%, transparent);
    }
  }
</style>