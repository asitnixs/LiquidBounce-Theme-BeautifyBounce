<script lang="ts">
    import type {ListSetting, ModuleSetting} from "../../../../integration/types";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../../theme/theme_config";
    import {createEventDispatcher} from "svelte";

    export let setting: ModuleSetting;
    const cSetting = setting as ListSetting;
    const dispatch = createEventDispatcher();

    function handleChange() { setting = {...cSetting}; dispatch("change"); }
    function removeValueIndex(index: number) { cSetting.value.splice(index, 1); cSetting.value = cSetting.value; handleChange(); }
    function addValueIndex() { cSetting.value = ["", ...cSetting.value]; handleChange(); }
</script>

<div class="setting-group">
    <div class="head">
        <div class="name">{$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</div>
        <button class="add-btn" on:click={addValueIndex} title="Add value">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
    </div>

    {#if cSetting.value.length > 0}
        <div class="inputs">
            {#each cSetting.value as _, index}
                <div class="input-wrapper">
                    <input type="text" class="value-input" spellcheck="false" placeholder="Value..." bind:value={cSetting.value[index]} on:input={handleChange}>
                    <button class="remove-btn" title="Remove" on:click={() => removeValueIndex(index)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
  .setting-group {
    padding: 6px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .name {
    font-weight: 500;
    color: var(--clickgui-text-color);
    font-size: 12px;
  }

  .add-btn {
    all: unset;
    cursor: pointer;
    background: transparent;
    border-radius: 8px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--clickgui-text-color);
    transition: all 0.4s;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: color-mix(in srgb, var(--accent-color) 40%, transparent);
    }
  }

  .inputs {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .value-input {
    flex: 1;
    background: var(--clickgui-window-background-color);
    border: 1px solid var(--clickgui-border-color);
    color: var(--clickgui-text-color);
    font-size: 12px;
    font-weight: 400;
    padding: 6px 8px;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.4s;

    &:focus {
      border-color: color-mix(in srgb, var(--accent-color) 40%, transparent);
    }
  }

  .remove-btn {
    all: unset;
    cursor: pointer;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--clickgui-text-color);
    background: transparent;
    border-radius: 8px;
    transition: all 0.4s;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: color-mix(in srgb, var(--accent-color) 40%, transparent);
    }
  }
</style>