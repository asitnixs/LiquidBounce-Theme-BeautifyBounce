<script lang="ts">
    import { intToRgba, rgbaToHex } from "../../integration/util";
    import ClickGuiToolTip from "./ClickGuiToolTip.svelte";

    export let settings: any[] = [];

    function findSetting(arr: any[], searchName: string): any {
        if (!arr || !Array.isArray(arr)) return null;
        let found: any = null;
        const targetName = searchName.replace(/\s/g, '').toLowerCase();

        function walk(currentArr: any[]) {
            if (found) return;
            for (let s of currentArr) {
                if (found) break;
                if (!s || typeof s !== 'object') continue;
                
                const sName = (s.name || "").replace(/\s/g, '').toLowerCase();
                if (sName === targetName) {
                    found = s;
                    return;
                }
                
                if (s.choices && typeof s.choices === 'object' && !Array.isArray(s.choices)) {
                    let activeKey = s.active || s.value; 
                    if (typeof activeKey === 'string') {
                        let activeChoice = s.choices[activeKey];
                        if (Array.isArray(activeChoice)) {
                            walk(activeChoice);
                        } else if (activeChoice && Array.isArray(activeChoice.value)) {
                            walk(activeChoice.value);
                        }
                    }
                } 
                if (Array.isArray(s.value)) {
                    walk(s.value);
                }
            }
        }
        
        try { walk(arr); } catch (e) {}
        return found;
    }

    function getBool(arr: any[], name: string, fallback: boolean): boolean {
        const s = findSetting(arr, name);
        if (!s) return fallback;
        if (typeof s.value === 'boolean') return s.value;
        if (Array.isArray(s.value) && s.value.length > 0 && typeof s.value[0].value === 'boolean') return s.value[0].value;
        return fallback;
    }

    function getNum(arr: any[], name: string, fallback: number): number {
        const s = findSetting(arr, name);
        if (s && typeof s.value === 'number') return s.value;
        return fallback;
    }

    function getString(arr: any[], name: string, fallback: string): string {
        const s = findSetting(arr, name);
        if (!s) return fallback;
        if (typeof s.active === 'string') return s.active;
        if (typeof s.value === 'string') return s.value;
        return fallback;
    }

        $: colorInt = getNum(settings, "Color", 4294967295);
    $: mainColor = rgbaToHex(intToRgba(colorInt));
    $: rgbArray = intToRgba(colorInt);

    $: mode = getString(settings, "Mode", "2D").toLowerCase().replace(/\s/g, '');

    $: outlineEnabled = getBool(settings, "Outline", false);
    $: borderEnabled = getBool(settings, "Border", false);
    $: hbEnabled = getBool(settings, "Health Bar", false);
    $: thickness = getNum(settings, "Thickness", 1);
    $: hbSpacing = getNum(settings, "Spacing", 2);

    $: cornerEnabled = getBool(settings, "Corner", false);
    $: fillEnabled = getBool(settings, "Fill", false);
    $: expandSize = getNum(settings, "Expand", 0.05) * 60;
    $: gapRaw = getNum(settings, "Gap", 75);
    $: cornerSize = Math.max(0, (100 - gapRaw) / 2);

    $: legacyScale = getNum(settings, "Scale", 0.1) * 10;
    $: legacyY = getNum(settings, "Y Offset", 0) * -10;

</script>

<div class="esp-preview-container">
<ClickGuiToolTip text="This ESP Preview is not 100% accurate" />
    <div class="preview-title">ESP Preview</div>
    
    <div class="preview-canvas">
        <div class="grid-bg"></div>

        <div class="player-scene">
            <img src="https://mc-heads.net/body/basota1337/100" 
                 class="player-model" 
                 class:is-glow={mode === 'glow'}
                 style="--glow-color: {mainColor};"
                 alt="basota1337" />

            {#if mode === 'legacy2d'}
                <div class="esp-legacy2d" style="
                    --color: {mainColor};
                    --thick: {thickness}px;
                    --scale: {legacyScale};
                    --y-offset: {legacyY}px;
                ">
                    <div class="corner top-left"> <div class="line h"></div> <div class="line v"></div> </div>
                    <div class="corner top-right"> <div class="line h"></div> <div class="line v"></div> </div>
                    <div class="corner bottom-left"> <div class="line h"></div> <div class="line v"></div> </div>
                    <div class="corner bottom-right"> <div class="line h"></div> <div class="line v"></div> </div>
                </div>

            {:else if mode === 'box'}
                <div class="esp-box3d" style="
                    --color: {mainColor};
                    --thick: {thickness}px;
                    --w: calc(44px + {expandSize * 2}px);
                    --h: calc(100px + {expandSize * 2}px);
                    --d: calc(44px + {expandSize * 2}px);
                ">
                    <div class="face front" class:has-outline={outlineEnabled}></div>
                    <div class="face back" class:has-outline={outlineEnabled}></div>
                    <div class="face left" class:has-outline={outlineEnabled}></div>
                    <div class="face right" class:has-outline={outlineEnabled}></div>
                    <div class="face top" class:has-outline={outlineEnabled}></div>
                    <div class="face bottom" class:has-outline={outlineEnabled}></div>
                </div>

            {:else}
                <div class="esp-2d" 
                     class:has-fill={fillEnabled}
                     style="
                        --color: {mainColor};
                        --thick: {thickness}px;
                        --exp: {expandSize}px;
                        --len: {cornerSize}%;
                     ">
                    <div class="fill-bg"></div>

                    {#if cornerEnabled && mode !== 'glow'}
                        <div class="corner top-left" class:has-border={borderEnabled || outlineEnabled}>
                            <div class="line h"></div> <div class="line v"></div>
                        </div>
                        <div class="corner top-right" class:has-border={borderEnabled || outlineEnabled}>
                            <div class="line h"></div> <div class="line v"></div>
                        </div>
                        <div class="corner bottom-left" class:has-border={borderEnabled || outlineEnabled}>
                            <div class="line h"></div> <div class="line v"></div>
                        </div>
                        <div class="corner bottom-right" class:has-border={borderEnabled || outlineEnabled}>
                            <div class="line h"></div> <div class="line v"></div>
                        </div>
                    {:else if mode !== 'glow'}
                        <div class="full-box" class:has-border={borderEnabled || outlineEnabled}></div>
                    {/if}
                </div>
            {/if}

            {#if hbEnabled && mode !== 'glow'}
                <div class="health-bar" style="
                    left: calc(-10px - {mode === 'box' ? expandSize : (mode === 'legacy2d' ? 0 : expandSize)}px - {hbSpacing}px);
                    top: calc(-5px - {mode === 'box' ? expandSize : (mode === 'legacy2d' ? 0 : expandSize)}px);
                    bottom: calc(-5px - {mode === 'box' ? expandSize : (mode === 'legacy2d' ? 0 : expandSize)}px);
                ">
                    <div class="health-fill"></div>
                </div>
            {/if}
        </div>
    </div>
</div>

<style lang="scss">
    .esp-preview-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 8px;
        background: var(--clickgui-window-background-color);
        border: 1px solid var(--clickgui-border-color);
        border-radius: 14px;
        padding: 12px;
    }

    .preview-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--clickgui-text-color);
        text-transform: uppercase;
    }

    .preview-canvas {
        position: relative;
        height: 200px;
        width: 100%;
        background: var(--clickgui-base-color);
        border-radius: 14px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
    }

    .grid-bg {
        position: absolute;
        inset: 0;
        background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
        background-size: 20px 20px;
        z-index: 0;
    }

    .player-scene {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .player-model {
        height: 100px;
        image-rendering: pixelated;
        pointer-events: none;
        transition: filter 0.1s;

        &.is-glow {
            filter: 
                drop-shadow(2px 0 0 var(--glow-color))
                drop-shadow(-2px 0 0 var(--glow-color))
                drop-shadow(0 2px 0 var(--glow-color))
                drop-shadow(0 -2px 0 var(--glow-color));
        }
    }

    .health-bar {
        position: absolute;
        width: 3px;
        background: #000;
        display: flex;
        align-items: flex-end;
        transition: left 0.1s, top 0.1s, bottom 0.1s;
        z-index: 5;

        .health-fill {
            width: 100%; height: 85%;
            background: #33ff33;
        }
    }

    .esp-box3d {
        position: absolute;
        width: var(--w);
        height: var(--h);
        transform-style: preserve-3d;
        transform: perspective(600px) rotateX(-12deg) rotateY(25deg);
        transition: width 0.1s, height 0.1s;
        z-index: 2;

        .face {
            position: absolute;
            background: color-mix(in srgb, var(--color) 15%, transparent);

            &.has-outline {
                border: var(--thick) solid var(--color);
            }
        }

        .front  { width: 100%; height: 100%; transform: translateZ(calc(var(--d) / 2)); }
        .back   { width: 100%; height: 100%; transform: rotateY(180deg) translateZ(calc(var(--d) / 2)); }
        .left   { width: var(--d); height: 100%; left: calc(50% - var(--d)/2); transform: rotateY(-90deg) translateZ(calc(var(--w) / 2)); }
        .right  { width: var(--d); height: 100%; left: calc(50% - var(--d)/2); transform: rotateY(90deg) translateZ(calc(var(--w) / 2)); }
        .top    { width: 100%; height: var(--d); top: calc(50% - var(--d)/2); transform: rotateX(90deg) translateZ(calc(var(--h) / 2)); }
        .bottom { width: 100%; height: var(--d); top: calc(50% - var(--d)/2); transform: rotateX(-90deg) translateZ(calc(var(--h) / 2)); }
    }

    .corner {
        position: absolute;
        .line { position: absolute; background: var(--color); }
        &.has-border .line { box-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; }
    }
    
    .top-left { top: 0; left: 0; .h { top: 0; left: 0; width: 100%; height: var(--thick); } .v { top: 0; left: 0; height: 100%; width: var(--thick); } }
    .top-right { top: 0; right: 0; .h { top: 0; right: 0; width: 100%; height: var(--thick); } .v { top: 0; right: 0; height: 100%; width: var(--thick); } }
    .bottom-left { bottom: 0; left: 0; .h { bottom: 0; left: 0; width: 100%; height: var(--thick); } .v { bottom: 0; left: 0; height: 100%; width: var(--thick); } }
    .bottom-right { bottom: 0; right: 0; .h { bottom: 0; right: 0; width: 100%; height: var(--thick); } .v { bottom: 0; right: 0; height: 100%; width: var(--thick); } }

    .esp-legacy2d {
        position: absolute;
        top: -5px; bottom: -5px; left: -4px; right: -4px;
        transform: translateY(var(--y-offset)) scale(var(--scale));
        transition: transform 0.1s;
        z-index: 2;

        .corner { width: 15%; height: 15%; }
    }

    .esp-2d {
        position: absolute;
        top: calc(-5px - var(--exp)); 
        bottom: calc(-5px - var(--exp)); 
        left: calc(-4px - var(--exp)); 
        right: calc(-4px - var(--exp));
        z-index: 3;
        transition: top 0.1s, bottom 0.1s, left 0.1s, right 0.1s;

        .fill-bg { position: absolute; inset: 0; transition: background-color 0.2s; }
        &.has-fill .fill-bg { background-color: color-mix(in srgb, var(--color) 25%, transparent); }

        .full-box {
            position: absolute; inset: 0;
            border: var(--thick) solid var(--color);
            &.has-border { box-shadow: 0 0 0 1px #000, inset 0 0 0 1px #000; }
        }

        .corner { width: var(--len); height: var(--len); transition: width 0.1s, height 0.1s; }
    }
</style>