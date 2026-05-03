<script lang="ts">
    import {listen} from "../../../integration/ws";
    import type {ClientPlayerDataEvent, ClientPlayerEffectEvent} from "../../../integration/events";
    import type {StatusEffect} from "../../../integration/types";
    import {effectTextureUrl} from "../../../integration/rest";
    import { fade, slide } from "svelte/transition";
    import { getSavedTheme } from "../../../theme/clickgui_theme";
    import { onDestroy, onMount } from "svelte";
    import { quintOut } from "svelte/easing";

    let effects: StatusEffect[] = [];
    let realEffects: StatusEffect[] = [];

    export let editMode = false;

    let activeTheme = getSavedTheme();
    $: iconFilter = activeTheme === "light" ? "brightness(0)" : "none";

    listen("clientPlayerData", (event: ClientPlayerDataEvent) => {
        realEffects = event.playerData.effects;
    });

    listen("clientPlayerEffect", (event: ClientPlayerEffectEvent) => {
        realEffects = event.effects;
    });

    function formatTime(duration: number): string {
        if (duration === -1) {
            return "*:*";
        }

        const totalSeconds = Math.floor(duration / 20);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    function toRoman(num: number): string {
        const romanMap: [number, string][] = [
            [10, "X"],
            [9, "IX"],
            [8, "VIII"],
            [7, "VII"],
            [6, "VI"],
            [5, "V"],
            [4, "IV"],
            [3, "III"],
            [2, "II"],
            [1, "I"]
        ];

        let result = "";
        for (const [value, symbol] of romanMap) {
            while (num >= value) {
                result += symbol;
                num -= value;
            }
        }
        return result;
    }

    onMount(async () => {
        window.addEventListener("storage", handleStorageChange);
    });

    onDestroy(() => {
        window.removeEventListener("storage", handleStorageChange);
    });

    function handleStorageChange(e: StorageEvent) {
        if (e.key === "liquidbounce_selected_theme") {
            activeTheme = (e.newValue as any) || "dark";
        }
    }

    function formatAmplifier(n: number): string {
      const level = n + 1;
      if (level === 1) return "";
      return toRoman(level);
    }

    let popEffects = new Set<string>();
    let prev = new Set<string>();

    $: {
        const current = new Set(effects.map(e => e.effect));

        current.forEach(id => {
            if (!prev.has(id)) {
                popEffects = new Set([...popEffects, id]);
                setTimeout(() => {
                    popEffects = new Set([...popEffects].filter(x => x !== id));
                }, 400);
            }
        });

        prev = current;
    }

    $: {
        if (realEffects && realEffects.length > 0) {
            effects = realEffects;
        } else if (editMode) {
            effects = [
                { effect: "minecraft:speed", localizedName: "Speed", duration: 2000, amplifier: 1, ambient: false, infinite: false, visible: true, showIcon: true, color: 0x7CAFC6 },
                { effect: "minecraft:strength", localizedName: "Strength", duration: 5920, amplifier: 0, ambient: false, infinite: false, visible: true, showIcon: true, color: 0x932423 },
                { effect: "minecraft:regeneration", localizedName: "Regeneration", duration: 65, amplifier: 2, ambient: false, infinite: false, visible: true, showIcon: true, color: 0xCD5CAB }
            ];
        } else {
            effects = [];
        }
    }
</script>

{#if effects.length > 0}
    <div class="effects-container"
     in:fade={{ duration: 300 }}
     out:fade={{ duration: 300 }}>
        <div class="header">
            <img class="header-icon" src="img/hud/effects/icon-potions.svg" alt="potions" style="filter: {iconFilter};">
            <span class="title">Potions</span>
        </div>

        <div class="entries">
            {#each effects as e (e.effect)}
                <div class="effect-row"
                     class:warning={e.duration > 0 && e.duration < 80}
                     class:pop={popEffects.has(e.effect)}
                     transition:fade={{ duration: 300 }}>
                    
                    <div class="icon-wrap">
                        <img class="effect-icon" src={effectTextureUrl(e.effect)} alt={e.localizedName}/>
                    </div>

                    <div class="name-wrap">
                        <span class="name">{e.localizedName}</span>
                        {#if formatAmplifier(e.amplifier)}
                            <span class="amplifier">{formatAmplifier(e.amplifier)}</span>
                        {/if}
                    </div>

                    <div class="duration-badge">
                        {formatTime(e.duration)}
                    </div>
                </div>
            {/each}
        </div>
    </div>
{/if}

<style lang="scss">
    .effects-container {
        display: flex;
        flex-direction: column;
        width: max-content;
        min-width: 190px;
        background: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        animation: popAnim 0.4s ease;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 12px 14px;
    }

    .header-icon {
        width: 16px;
        height: 16px;
    }

    .title {
        font-size: 16px;
        font-weight: 500;
        color: var(--clickgui-text-color);
    }
    
    .entries {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 2px 12px 8px 12px;
    }

    .effect-row {
        display: flex;
        align-items: center;
        gap: 4px;
        transition: transform 0.4s ease, opacity 0.4s ease;

        &.pop {
            transform: scale(1.05);
        }

        &.warning {
            .duration-badge {
                animation: pulse-warning 1s infinite alternate;
                color: #ff5555;
            }
        }
    }

    .icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .effect-icon {
        width: 18px;
        height: 18px;
    }

    .name-wrap {
        display: flex;
        align-items: baseline;
        gap: 4px;
        flex: 1;
        min-width: 0;
    }

    .name {
        font-size: 14px;
        font-weight: 500;
        color: var(--clickgui-text-color);
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        white-space: nowrap;
    }

    .amplifier {
        font-size: 12px;
        font-weight: 400;
        color: var(--accent-color);
        text-shadow: 0 1px 4px color-mix(in srgb, var(--accent-color) 40%, transparent);
    }

    .duration-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 4px 0;
        color: var(--clickgui-text-dimmed-color);
        font-size: 12px;
        font-weight: 400;
        font-variant-numeric: tabular-nums;
        transition: all 0.4s ease;
    }

    @keyframes pulse-warning {
        0% {
            opacity: 1;
            text-shadow: 0 0 0 rgba(255, 85, 85, 0);
        }
        100% {
            opacity: 0.6;
            text-shadow: 0 0 6px rgba(255, 85, 85, 0.4);
        }
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
