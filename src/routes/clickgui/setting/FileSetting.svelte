<script lang="ts">
    import type {FileSetting, ModuleSetting} from "../../../integration/types";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import {browsePath, openFileDialog} from "../../../integration/rest";
    import {createEventDispatcher} from "svelte";

    export let setting: ModuleSetting;
    const cSetting = setting as FileSetting;
    let selecting = false;
    const dispatch = createEventDispatcher();

    function handleChange() {
        setting = {...cSetting};
        dispatch("change");
    }

    async function selectFile() {
        if (selecting) return;
        selecting = true;
        let file = await openFileDialog({ mode: cSetting.dialogMode, supportedExtensions: cSetting.supportedExtensions });
        selecting = false;
        if (file.file !== undefined) {
            cSetting.value = file.file;
            handleChange();
        }
    }

    function resetFile() {
        cSetting.value = '';
        handleChange();
    }
</script>

<div class="setting">
    <div class="name">{$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</div>

    <div class="body">
        <button class="button-select" on:click={selectFile}>
            {cSetting.value === "" ? "Click to select file" : cSetting.value}
        </button>

        {#if cSetting.value !== ""}
            <button class="button-action reset" on:click={resetFile} title="Clear">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <button class="button-action open" on:click={() => browsePath(cSetting.value)} title="Open Folder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </button>
        {/if}
    </div>
</div>

<style lang="scss">
  .setting {
    padding: 6px 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .name {
    font-weight: 500;
    color: var(--clickgui-text-color);
    font-size: 12px;
  }

  .body {
    display: flex;
    gap: 6px;
    width: 100%;
  }

  .button-select {
    flex: 1;
    background: var(--clickgui-window-background-color);
    border: 1px solid var(--clickgui-border-color);
    border-radius: 8px;
    padding: 6px 8px;
    color: var(--clickgui-text-dimmed-color);
    font-size: 12px;
    font-weight: 400;
    cursor: pointer;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all 0.4s;

    &:hover {
        border-color: color-mix(in srgb, var(--accent-color) 40%, transparent);
        color: var(--clickgui-text-color);
    }
  }

  .button-action {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: transparent;
    color: var(--clickgui-text-dimmed-color);
    transition: all 0.4s;

    svg {
        width: 14px;
        height: 14px;
    }
    
    &.open:hover {
        background-color: color-mix(in srgb, var(--accent-color) 40%, transparent);
    }

    &.reset:hover {
        background-color: color-mix(in srgb, var(--accent-color) 40%, transparent);
    }
  }
</style>