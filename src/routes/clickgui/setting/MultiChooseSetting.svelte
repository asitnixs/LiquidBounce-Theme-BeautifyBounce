<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import type {ModuleSetting, MultiChooseSetting,} from "../../../integration/types";
    import {slide} from "svelte/transition";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";

    export let setting: ModuleSetting;
    const cSetting = setting as MultiChooseSetting;
    const dispatch = createEventDispatcher();

    function handleChange(v: string) {
        if (cSetting.value.includes(v)) {
            const filtered = cSetting.value.filter(item => item !== v);
            if (filtered.length === 0 && !cSetting.canBeNone) return;
            cSetting.value = filtered;
        } else {
            cSetting.value = [...cSetting.value, v];
        }
        setting = {...cSetting};
        dispatch("change");
    }
</script>

<div class="setting">
    <div class="head">
        <div class="title">{$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</div>
    </div>

    <div class="chips-container">
        {#each cSetting.choices as choice (choice)}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class="chip"
                class:active={cSetting.value.includes(choice)}
                on:click={() => handleChange(choice)}
            >
                {$spaceSeperatedNames ? convertToSpacedString(choice) : choice}
            </div>
        {/each}
    </div>
</div>

<style lang="scss">
  .setting {
    padding: 6px 0;
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .title {
    color: var(--clickgui-text-color);
    font-size: 12px;
    font-weight: 500;
  }

  .chips-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chip {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.4s ease;
    background: transparent;
    border: 1px solid var(--clickgui-border-color);
    color: var(--clickgui-text-dimmed-color);

    &:hover {
      border-color: color-mix(in srgb, var(--accent-color) 40%, transparent);
      color: var(--clickgui-text-color);
    }

    &.active {
      border-color: var(--accent-color);
      color: var(--clickgui-text-color);
    }
  }
</style>