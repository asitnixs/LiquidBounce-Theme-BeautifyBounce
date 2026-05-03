<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import type {ModuleSetting, TextSetting,} from "../../../integration/types";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import {setTyping} from "../../../integration/rest";

    export let setting: ModuleSetting;

    const cSetting = setting as TextSetting;

    const dispatch = createEventDispatcher();

    function handleChange() {
        setting = {...cSetting};
        dispatch("change");
    }
</script>

<div class="setting">
    <div class="name">{$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</div>
    <input type="text" class="value" spellcheck="false"
           placeholder={$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}
           bind:value={cSetting.value}
           on:input={handleChange}
           on:focusin={async () => await setTyping(true)}
           on:focusout={async () => await setTyping(false)}
    >
</div>

<style lang="scss">

  .setting {
    padding: 6px 0px;
  }

  .name {
    font-weight: 500;
    color: var(--clickgui-text-color);
    font-size: 12px;
    margin-bottom: 5px;
  }

  .value {
    width: 100%;
    background: var(--clickgui-window-background-color);
    font-weight: 400;
    font-size: 12px;
    color: var(--clickgui-text-color);
    border: 1px solid var(--clickgui-border-color);
    border-radius: 8px;
    padding: 6px 10px;
    outline: none;
    transition: border-color 0.4s, background 0.4s;

    &:focus {
      border-color: color-mix(in srgb, var(--accent-color) 40%, transparent);
    }
  }
</style>
