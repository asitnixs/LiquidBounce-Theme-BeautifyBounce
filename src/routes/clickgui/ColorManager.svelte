<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { fade, fly } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import "@simonwep/pickr/dist/themes/classic.min.css";
    import "../../routes/clickgui/setting/pickr.scss";
    import Pickr from "@simonwep/pickr";

    import { accentColor, saveAccentColor } from "../../theme/ColorStore";
    import { get } from "svelte/store";

    export let onClose: () => void;

    let pickrEl: HTMLElement;
    let pickr: Pickr | null = null;
    let containerEl: HTMLElement;

    let hexColor = get(accentColor);

    function onHexInput(e: Event) {
        const val = (e.target as HTMLInputElement).value.trim();
        if (/^#[0-9A-Fa-f]{6}$/i.test(val)) {
            hexColor = val.toUpperCase();
            pickr?.setColor(hexColor);
            accentColor.set(hexColor);
            saveAccentColor(hexColor);
        }
    }

    onMount(() => {
        pickr = Pickr.create({
            el: pickrEl,
            theme: "classic",
            showAlways: true,
            inline: true,
            default: hexColor,
            components: {
                preview: false,
                opacity: false,
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
            const hexa = color.toHEXA();
            hexColor = ("#" + hexa[0] + hexa[1] + hexa[2]).toUpperCase();
            accentColor.set(hexColor);
        });

        pickr.on("changestop", () => {
            saveAccentColor(hexColor);
        });

        pickr.on("swatchselect", () => {
            saveAccentColor(hexColor);
        });
    });

    onDestroy(() => {
        pickr?.destroyAndRemove();
    });

    function handleWindowClick(e: MouseEvent) {
        if (containerEl && !containerEl.contains(e.target as Node)) {
            onClose();
        }
    }
</script>

<svelte:window onclick={handleWindowClick} />

<div
    class="color-popup"
    bind:this={containerEl}
    transition:fade={{ duration: 300 }}
    onclick={(e) => e.stopPropagation()}
>
    <div class="pickr-wrapper">
        <button bind:this={pickrEl} />
    </div>

    <div class="popup-footer">
        <div class="format-label">HEX</div>
        <div class="hex-box">
            <div
                class="mini-preview"
                style="background-color: {$accentColor};"
            ></div>
            <input
                type="text"
                class="hex-input"
                bind:value={hexColor}
                oninput={onHexInput}
                maxlength="7"
                spellcheck="false"
            />
        </div>
    </div>
</div>

<style lang="scss">
    .color-popup {
        position: absolute;
        bottom: -15px;
        left: calc(100% + -90px);
        background: var(--clickgui-base-color);
        border: 1px solid var(--clickgui-border-color);
        border-radius: 14px;
        padding: 12px;
        width: 240px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .pickr-wrapper {
        width: 100%;
        :global(.pcr-app) {
            width: 100% !important;
            padding: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
        }
    }

    .popup-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--clickgui-input-background-color);
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

    .color-popup {
        animation: popAnim 0.4s ease
    }

    @keyframes popAnim {
    0% {
      transform: scale(0.98);
    }
    50% {
      transform: scale(1.02);
    }
    100% {
      transform: scale(1);
    }
  }
</style>