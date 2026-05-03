<script lang="ts">
    import {createEventDispatcher, onDestroy} from "svelte";
    import type {BindModifier, BindSetting, ModuleSetting} from "../../../../integration/types";
    import {waitMatches} from "../../../../integration/ws";
    import type {KeyboardKeyEvent, MouseButtonEvent} from "../../../../integration/events";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../../theme/theme_config";
    import BindDisplay from "./BindDisplay.svelte";
    import SwitchBindAction from "./SwitchBindAction.svelte";
    import {isClickGuiScreen, UNKNOWN_KEY} from "../../../../util/utils";

    const KEY_TOKEN_TO_MODIFIERS: Record<number, BindModifier> = {
        340: "Shift", 344: "Shift", 341: "Control", 345: "Control",
        342: "Alt", 346: "Alt", 343: "Super", 347: "Super",
    } as const;

    const KEY_CODE_TO_MODIFIERS: Record<string, BindModifier> = {
        "key.keyboard.left.shift": "Shift", "key.keyboard.right.shift": "Shift",
        "key.keyboard.left.control": "Control", "key.keyboard.right.control": "Control",
        "key.keyboard.left.alt": "Alt", "key.keyboard.right.alt": "Alt",
        "key.keyboard.left.win": "Super", "key.keyboard.right.win": "Super",
    } as const;

    export let setting: ModuleSetting;
    const cSetting = setting as BindSetting;
    const dispatch = createEventDispatcher();

    export let hideAction: boolean = false;

    let isHovered = false;
    let binding = false;
    let addedModifiers = new Set<BindModifier>();
    let timeout: ReturnType<typeof setTimeout> | undefined = undefined;

    const nextBindEvent = () => Promise.any([
        waitMatches("mouseButton", (e: MouseButtonEvent) => isClickGuiScreen(e.screen) && !(e.button === 0 && isHovered)),
        waitMatches("keyboardKey", (e: KeyboardKeyEvent) => isClickGuiScreen(e.screen)),
    ]);

    const handleBindEventIfNotModifier = (event: MouseButtonEvent | KeyboardKeyEvent) => {
        if (Object.hasOwn(event, "keyCode")) {
            const e = event as KeyboardKeyEvent;
            if (e.keyCode === 256) { handleActionChange(UNKNOWN_KEY); return; }
            const modifier = KEY_TOKEN_TO_MODIFIERS[e.keyCode];
            if (!modifier) { handleActionChange(e.key); return; }
            return {key: e.key, keyCode: e.keyCode, modifier};
        } else if (Object.hasOwn(event, "button")) {
            const e = event as MouseButtonEvent;
            handleActionChange(e.key);
        }
    }

    onDestroy(() => { if (timeout !== undefined) clearTimeout(timeout); });

    async function toggleBinding() {
        if (binding) { handleActionChange(UNKNOWN_KEY); return; }
        binding = true;

        let event = await nextBindEvent();
        if (!binding) return;
        let result = handleBindEventIfNotModifier(event);

        while (result) {
            if (timeout !== undefined) clearTimeout(timeout);
            const {key, modifier} = result;
            addedModifiers.add(modifier);
            addedModifiers = addedModifiers;
            timeout = setTimeout(() => { if (binding) handleActionChange(key); timeout = undefined; }, 1000);
            event = await nextBindEvent();
            if (!binding) return;
            result = handleBindEventIfNotModifier(event);
        }
    }

    function handleActionChange(newBoundKey: string) {
        addedModifiers.delete(KEY_CODE_TO_MODIFIERS[newBoundKey]);
        cSetting.value.boundKey = newBoundKey;
        cSetting.value.modifiers = Array.from(addedModifiers);
        addedModifiers.clear();
        binding = false;
        handleChange();
    }

    function handleChange() {
        setting = {...cSetting};
        dispatch("change");
    }

    export let moduleName: string = "";

    function getHidden(): Set<string> {
        try { return new Set(JSON.parse(localStorage.getItem("keybinds_hidden") ?? "[]")); }
        catch { return new Set(); }
    }

    let hidden = getHidden().has(moduleName);

    function toggleHidden() {
        const set = getHidden();
        if (set.has(moduleName)) set.delete(moduleName);
        else set.add(moduleName);
        localStorage.setItem("keybinds_hidden", JSON.stringify([...set]));
        hidden = set.has(moduleName);
        window.dispatchEvent(new Event("keybinds-hidden-change"));
    }
</script>

<div class="setting-row">
    <div class="name">{$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</div>
    
    <div class="controls">
        {#if cSetting.value.boundKey !== UNKNOWN_KEY && !hideAction}
            <SwitchBindAction choices={["Toggle", "Hold", "Smart"]} bind:chosen={cSetting.value.action} onchange={handleChange} />
        {/if}

        <button class="bind-btn" class:binding on:click={toggleBinding} on:mouseenter={() => isHovered = true} on:mouseleave={() => isHovered = false}>
            {#if !binding}
                <BindDisplay bind:modifiers={cSetting.value.modifiers} bind:boundKey={cSetting.value.boundKey} />
            {:else if addedModifiers.size}
                <BindDisplay bind:modifiers={addedModifiers} boundKey="..." literal={true} />
            {:else}
                <span class="listening">...</span>
            {/if}
        </button>
    </div>
</div>

<style lang="scss">
  .setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
  }

  .name {
    font-size: 12px;
    font-weight: 500;
    color: var(--clickgui-text-dimmed-color);
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .bind-btn {
    all: unset;
    background: var(--clickgui-window-background-color);
    border: 1px solid var(--clickgui-border-color);
    padding: 4px 10px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
    color: var(--clickgui-text-color);
    transition: all 0.4s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;

    &:hover {
      border-color: color-mix(in srgb, var(--accent-color) 40%, transparent);
    }

    &.binding {
      border-color: color-mix(in srgb, var(--accent-color) 60%, transparent);
    }
  }

  .listening {
    animation: pulse 1s infinite alternate;
  }

  @keyframes pulse {
    from { opacity: 0.5; }
    to { opacity: 1; }
  }
</style>