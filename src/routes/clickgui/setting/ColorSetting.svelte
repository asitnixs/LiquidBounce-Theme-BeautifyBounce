<script lang="ts">
    import "@simonwep/pickr/dist/themes/classic.min.css";
    import "./pickr.scss";
    import {createEventDispatcher, onMount, onDestroy} from "svelte";
    import type {ColorSetting, ModuleSetting,} from "../../../integration/types.js";
    import Pickr from "@simonwep/pickr";
    import {convertToSpacedString, spaceSeperatedNames} from "../../../theme/theme_config";
    import {intToRgba, rgbaToHex, rgbaToInt} from "../../../integration/util";

    export let setting: ModuleSetting;

    const cSetting = setting as ColorSetting;
    const dispatch = createEventDispatcher();

    let colorPickerElement: HTMLElement;
    let pickr: Pickr | null = null;
    
    let modalOpen = false;
    let modalContainer: HTMLElement;

    let hex = rgbaToHex(intToRgba(cSetting.value));
    $: opacityPercent = Math.round((intToRgba(cSetting.value)[3] / 255) * 100);

    onMount(() => {
        pickr = Pickr.create({
            el: colorPickerElement,
            theme: "classic",
            showAlways: true,
            inline: true,
            default: rgbaToHex(intToRgba(cSetting.value)),
            components: {
                preview: false,
                opacity: true,
                hue: true,
                interaction: {
                    hex: false,
                    rgba: false,
                    hsla: false,
                    hsva: false,
                    cmyk: false,
                    input: false,
                    clear: false,
                    save: false,
                },
            },
        });

        pickr.on("change", (color: Pickr.HSVaColor) => {
            hex = color.toHEXA().toString();
            const [r, g, b, a] = color.toRGBA();
            const rgba = [r, g, b, a * 255];

            cSetting.value = rgbaToInt(rgba);
            setting = { ...cSetting };
            dispatch("change");
        });
    });

    onDestroy(() => {
        if (pickr) {
            pickr.destroyAndRemove();
        }
    });

    function toggleModal(e: Event) {
        e.stopPropagation();
        modalOpen = !modalOpen;
    }

    function handleWindowClick(e: MouseEvent) {
        if (modalOpen && modalContainer && !modalContainer.contains(e.target as Node)) {
            modalOpen = false;
        }
    }

    function handleHexInput() {
        if (/^#[0-9A-F]{6,8}$/i.test(hex)) {
            pickr?.setColor(hex);
        }
    }
</script>

<svelte:window on:click={handleWindowClick} />

<div class="setting-row" bind:this={modalContainer}>
    
    <div class="name">{$spaceSeperatedNames ? convertToSpacedString(cSetting.name) : cSetting.name}</div>
    <div class="color-btn" style="background-color: {hex};" on:click={toggleModal}></div>
    <div class="color-popup" class:visible={modalOpen} on:click|stopPropagation>
        <div class="pickr-wrapper">
            <button bind:this={colorPickerElement} />
        </div>

        <div class="popup-footer">
            <div class="format-label">HEX</div>
            <div class="hex-box">
                <div class="mini-preview" style="background-color: {hex};"></div>
                <input 
                    type="text" 
                    class="hex-input" 
                    bind:value={hex} 
                    on:input={handleHexInput} 
                    maxlength="9" 
                    spellcheck="false" 
                />
            </div>
            <div class="opacity-label">{opacityPercent}%</div>
        </div>

    </div>

</div>

<style lang="scss">
  .setting-row {
    position: relative;
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

  .color-btn {
    width: 18px;
    height: 18px;
    border-radius: 6px;
    cursor: pointer;
    transition: transform 0.4s ease, box-shadow 0.4s ease;

    &:hover {
      transform: scale(1.1);
    }
  }

  .color-popup {
    position: absolute;
    top: calc(100% + 0px);
    right: 0;
    background: var(--clickgui-window-background-color);
    border: 1px solid var(--clickgui-border-color);
    border-radius: 14px;
    padding: 12px;
    width: 240px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    z-index: 999999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-10px);
    transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    &.visible {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0);
    }
  }

  .pickr-wrapper {
    width: 100%;
    :global(.pcr-app) {
      width: 100% !important;
      padding: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }
    :global(.pcr-interaction) {
      margin-top: 10px !important;
    }
  }

  .popup-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--clickgui-window-background-color);
    border: 1px solid var(--clickgui-border-color);
    padding: 6px 10px;
    border-radius: 8px;
    gap: 8px;
  }

  .format-label {
    font-size: 12px;
    font-weight: 400;
    color: var(--clickgui-text-dimmed-color);
  }

  .hex-box {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
  }

  .mini-preview {
    width: 14px;
    height: 12px;
    border-radius: 4px;
  }

  .hex-input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--clickgui-text-color);
    font-family: inherit;
    font-size: 12px;
    font-weight: 400;
    text-transform: uppercase;
    width: 100%;
  }

  .opacity-label {
    font-size: 12px;
    font-weight: 400;
    color: var(--clickgui-text-dimmed-color);
    font-variant-numeric: tabular-nums;
  }
</style>