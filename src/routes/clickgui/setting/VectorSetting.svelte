<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import type {BlockHitResult, ModuleSetting, Setting, Vec, Vec3Setting, VecAxis} from "../../../integration/types";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import {getCrosshairData, getPlayerData} from "../../../integration/rest";

    export let setting: ModuleSetting;
    export let vecAxes: VecAxis[];
    export let step: number;

    const cSetting = setting as Setting<Vec<typeof vecAxes[number]>>;
    const useLocateButton = (setting as Vec3Setting).useLocateButton ?? false;
    const dispatch = createEventDispatcher();

    function handleChange() {
        setting = {...cSetting};
        dispatch("change");
    }

    async function locate() {
        const hitResult = await getCrosshairData();
        if (hitResult.type === "block") {
            const blockHitResult = hitResult as BlockHitResult;
            (cSetting as Vec3Setting).value = blockHitResult.blockPos;
        } else {
            const playerData = await getPlayerData();
            (cSetting as Vec3Setting).value = playerData.blockPosition;
        }
        handleChange();
    }
</script>

<div class="setting">
    <div class="header">
        <div class="name">{$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</div>
        {#if useLocateButton}
            <button class="locate-btn" on:click={locate} title="Locate Block">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
        {/if}
    </div>
    
    <div class="input-group">
        {#each vecAxes as axis (axis)}
            <div class="input-wrapper">
                <span class="axis-label">{axis.toUpperCase()}</span>
                <input type="number" {step} class="value" spellcheck="false" bind:value={cSetting.value[axis]} on:input={handleChange} />
            </div>
        {/each}
    </div>
</div>

<style lang="scss">
  .setting {
    padding: 6px 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .name {
    font-weight: 500;
    color: var(--clickgui-text-color);
    font-size: 12px;
  }

  .locate-btn {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--clickgui-text-dimmed-color);
    transition: color 0.4s;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }

  .input-group {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    background: var(--clickgui-window-background-color);
    border: 1px solid var(--clickgui-border-color);
    border-radius: 8px;
    padding: 4px 8px;
    transition: border-color 0.4s;
    
    &:focus-within {
      border-color: color-mix(in srgb, var(--accent-color) 40%, transparent);
    }
  }

  .axis-label {
    font-size: 12px;
    font-weight: 400;
    color: var(--clickgui-text-dimmed-color);
    margin-right: 6px;
  }

  input.value {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--clickgui-text-color);
    font-size: 12px;
    font-weight: 400;
    outline: none;
    
    &::-webkit-outer-spin-button, &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
</style>