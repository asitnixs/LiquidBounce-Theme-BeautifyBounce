<script lang="ts">
    import type {BooleanSetting as TBooleanSetting, ModuleSetting,} from "../../../../integration/types";
    import {fade} from "svelte/transition";
    import SwitchSetting from "./SwitchSetting.svelte";
    import GenericSetting from "../../../clickgui/setting/common/GenericSetting.svelte";
    import {quintOut} from "svelte/easing";
    import {convertToSpacedString} from "../../../../theme/theme_config";

    interface Props {
        value: NesterSetting,
        path: string
    }

    interface NesterSetting {
        name: string;
        valueType: string;
        value: ModuleSetting[];
    }

    const {value = $bindable(), path}: Props = $props();

    const enabledSetting = value.value[0] as TBooleanSetting;

    let expanded = $state(false);
    let wrappedSettingElement: HTMLElement;
    let headerElement: HTMLElement;

    function handleWrapperClick(e: MouseEvent) {
        if (!expanded) {
            expanded = true;
        } else {
            expanded = !headerElement.contains(e.target as Node);
        }
    }

    function handleWindowClick(e: MouseEvent) {
        if (!wrappedSettingElement) return;

        const node = e.target as HTMLElement;

        if (!wrappedSettingElement.contains(node)
            && !node.classList.contains("option")) { // Don't close when a select option is pressed
            expanded = false;
        }
    }
</script>

<svelte:window on:click={handleWindowClick}/>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="wrapped-setting" class:expanded class:has-nested-settings={value.value.length > 0}
     onclick={handleWrapperClick} bind:this={wrappedSettingElement}>
    <div class="header" bind:this={headerElement}>
        {#if value.valueType === "TOGGLEABLE"}
            <SwitchSetting title={convertToSpacedString(value.name)} bind:value={enabledSetting.value}/>
        {:else if value.valueType === "CONFIGURABLE"}
            <span class="configurable-title">{convertToSpacedString(value.name)}</span>
        {:else }
            Unsupported value type {value.valueType}
        {/if}
        {#if value.value.length > 0}
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        {/if}
    </div>

    {#if expanded && value.value.length > 0}
        <div class="nested-settings" transition:fade|global={{ duration: 200, easing: quintOut }}>
            {#each value.value as setting, i (setting.name)}
                <GenericSetting {path} bind:setting={value.value[i]} on:change/>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">

  .configurable-title {
    color: var(--clickgui-text-color);
    font-size: 20px;
    font-weight: 500;
  }

  .expanded .header {
    
    .chevron {
        transform: rotate(-180deg);
    }
  }

  .wrapped-setting {
    position: relative;
    min-width: 300px;

    &.has-nested-settings {
      cursor: pointer;

      .header {
        background: var(--clickgui-base-color);
        border: 1px solid var(--clickgui-border-color);
        padding: 20px;
        display: flex;
        column-gap: 20px;
        align-items: center;
        justify-content: space-between;
        border-radius: 14px;
        transition: all 0.4s ease;

        &:hover {
            background: var(--clickgui-window-background-color);
        }

        .chevron {
            width: 18px;
            height: 18px;
            color: var(--clickgui-text-dimmed-color);
            transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      }
    }
  }

  .nested-settings {
    position: absolute;
    z-index: 1000;
    background-color: var(--clickgui-base-color);
    margin-top: 6px;
    zoom: 1.5;
    width: 100%;
    border: 1px solid var(--clickgui-border-color);
    border-radius: 14px;
    padding: 6px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }
</style>

