<script lang="ts">
    import { listen } from "../../../integration/ws";
    import type { ClientPlayerDataEvent } from "../../../integration/events";
    import type { PlayerData } from "../../../integration/types";
    import { onMount } from "svelte";

    export let settings: { [name: string]: any };
    export let editMode = false;

    const HISTORY_SIZE = 50;
    let history: number[] = new Array(HISTORY_SIZE).fill(0);
    
    let speed = 0;
    let textSpeed = 0;
    let tickCounter = 0;

    let lastX = 0, lastY = 0, lastZ = 0;
    let playerData: PlayerData | null = null;

    listen("clientPlayerData", (event: ClientPlayerDataEvent) => {
        if (editMode) return;

        if (playerData) {
            lastX = playerData.position.x;
            lastY = playerData.position.y;
            lastZ = playerData.position.z;
        }
        playerData = event.playerData;
        
        const dx = playerData.position.x - lastX;
        const dy = playerData.position.y - lastY;
        const dz = playerData.position.z - lastZ;
        
        speed = Math.hypot(dx, dy, dz) * 20;
        history = [...history.slice(1), speed];

        tickCounter++;
        if (tickCounter >= 1) {
            textSpeed = speed;
            tickCounter = 0;
        }
    });

    onMount(() => {
        if (editMode) {
            let offset = 0;
            const demoInterval = setInterval(() => {
                const newSpeed = 15 + Math.sin(offset * 0.2) * 8 + Math.cos(offset * 0.4) * 4;
                history = [...history.slice(1), newSpeed];
                offset++;

                if (offset % 3 === 0) {
                    textSpeed = newSpeed;
                }
            }, 50);
            
            return () => clearInterval(demoInterval);
        }
    });

    $: maxBps = Math.max(5, ...history);
    $: graphMax = maxBps * 1.3;

    function getPath(data: number[]) {
        if (data.length === 0) return "";
        const pts = data.map((v, i) => ({
            x: (i / (HISTORY_SIZE - 1)) * 200,
            y: 80 - (v / graphMax) * 80
        }));

        let path = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
        const dx = (200 / (HISTORY_SIZE - 1)) * 0.35;

        for (let i = 0; i < pts.length - 1; i++) {
            const current = pts[i];
            const next = pts[i + 1];
            path += ` C ${(current.x + dx).toFixed(2)} ${current.y.toFixed(2)}, ` +
                    `${(next.x - dx).toFixed(2)} ${next.y.toFixed(2)}, ` +
                    `${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
        }
        return path;
    }

    $: linePath = getPath(history);
    $: fillPath = `${linePath} L 200 80 L 0 80 Z`;
</script>

<div class="motion-graph-container">
    <div class="header">
        <div class="title-wrap">
            <span class="title">Speed</span>
        </div>
        <div class="value-wrap">
            <span class="value">{textSpeed.toFixed(2)}</span>
            <span class="unit">b/s</span>
        </div>
    </div>

    <div class="graph-wrapper">
        <svg viewBox="0 0 200 80" preserveAspectRatio="none" class="graph-svg">
            <defs>
                <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--accent-color)" stop-opacity="0.45" />
                    <stop offset="100%" stop-color="var(--accent-color)" stop-opacity="0.0" />
                </linearGradient>
            </defs>

            <path class="fill-path" d={fillPath} fill="url(#graphGradient)" />
            <path class="line-path" d={linePath} fill="none" stroke="var(--accent-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    </div>
</div>

<style lang="scss">
    .motion-graph-container {
        display: flex;
        flex-direction: column;
        width: 200px;
        background: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        animation: popAnim 0.4s ease;
    }

    .header {
        display: flex;
        flex-direction: column;
        padding: 12px 14px;
    }

    .title-wrap {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .title {
        font-size: 14px;
        font-weight: 500;
        color: var(--clickgui-text-dimmed-color);
        text-transform: uppercase;
    }

    .value-wrap {
        display: flex;
        align-items: baseline;
        gap: 4px;
    }

    .value {
        font-size: 20px;
        font-weight: 400;
        color: var(--clickgui-text-color);
        font-variant-numeric: tabular-nums;
        text-shadow: 0 0 8px color-mix(in srgb, var(--clickgui-text-color) 40%, transparent);
    }

    .unit {
        font-size: 14px;
        font-weight: 500;
        color: var(--accent-color);
    }

    .graph-wrapper {
        width: 100%;
        height: 80px;
        position: relative;
    }

    .graph-svg {
        width: 100%;
        height: 100%; 
        display: block;
    }

    .line-path {
        filter: drop-shadow(0 4px 6px color-mix(in srgb, var(--accent-color) 40%, transparent));
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