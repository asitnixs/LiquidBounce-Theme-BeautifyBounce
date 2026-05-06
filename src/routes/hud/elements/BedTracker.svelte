<script lang="ts">
    import { listen } from "../../../integration/ws";
    import type { BedState } from "../../../integration/types";
    import type { BedStateChangeEvent, ClientPlayerDataEvent } from "../../../integration/events";
    import { itemTextureUrl } from "../../../integration/rest";
    import { fade } from "svelte/transition";
    import { onMount, onDestroy } from "svelte";
    import { getSavedTheme } from "../../../theme/clickgui_theme";

    export let settings: { [name: string]: any } = {};
    export let editMode = false;

    let activeTheme = getSavedTheme();
    $: iconFilter = activeTheme === "light" ? "brightness(0)" : "none";

    let bedStates: BedState[] = [];
    let playerPos = { x: 0, y: 0, z: 0 };
    let playerYaw = 0;

    const MAX_BEDS_TO_SHOW = 4;

    const JUNK_BLOCKS = [
        "bed", "carpet", "short_grass", "tall_grass", "fern", "large_fern", "flower", "rose", 
        "dandelion", "orchid", "tulip", "bluet", "daisy", "torch", "lantern", "hopper",
        "door", "trapdoor", "button", "pressure_plate", "lever", "sign", "banner", 
        "fence", "fence_gate", "wall", "glass_pane", "iron_bars", "chain", "vine", 
        "leaves", "lily_pad", "mushroom", "cobweb", "rail", "redstone", "wire", "repeater", 
        "comparator", "daylight_detector", "tripwire", "sapling", "dead_bush", "bell", "snow"
    ];

    function isDefBlock(blockId: string): boolean {
        if (!blockId) return false;
        const lowerId = blockId.toLowerCase();
        return !JUNK_BLOCKS.some(junk => lowerId.includes(junk));
    }

    listen("bedStateChange", (e: BedStateChangeEvent) => {
        if (editMode) return;
        bedStates = e.bedStates;
    });

    listen("clientPlayerData", (e: ClientPlayerDataEvent) => {
        if (editMode) return;
        playerPos = e.playerData.position;
        playerYaw = e.playerData.yaw;
    });

    function getDistanceRaw(targetPos: { x: number, y: number, z: number }, currentPos: { x: number, y: number, z: number }) {
        return Math.hypot(
            currentPos.x - targetPos.x,
            currentPos.y - targetPos.y,
            currentPos.z - targetPos.z
        );
    }

    $: processedBeds = bedStates
        .map(bed => {
            return {
                ...bed,
                distance: getDistanceRaw(bed.pos, playerPos),
                filteredBlocks: bed.compactSurroundingBlocks
                    .filter(b => isDefBlock(b.block))
                    .sort((a, b) => b.count - a.count)
            };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, MAX_BEDS_TO_SHOW);

    let bedRotations: Record<string, number> = {};

    function getArrowRotation(bedId: string, targetPos: { x: number, y: number, z: number }, currentPos: { x: number, y: number, z: number }, yaw: number) {
        const dx = targetPos.x - currentPos.x;
        const dz = targetPos.z - currentPos.z;
        
        let targetAngle = Math.atan2(dz, dx) * (180 / Math.PI) - 90 - yaw;
        
        targetAngle = ((targetAngle % 360) + 540) % 360 - 180;

        let currentAngle = bedRotations[bedId] || 0;
        
        let delta = targetAngle - (currentAngle % 360);
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;

        let newAngle = currentAngle + delta;
        bedRotations[bedId] = newAngle;

        return newAngle;
    }

    function handleStorageChange(e: StorageEvent) {
        if (e.key === "liquidbounce_selected_theme") {
            activeTheme = (e.newValue as any) || "dark";
        }
    }

    function handleImageError(e: Event) {
        (e.target as HTMLImageElement).src = itemTextureUrl("minecraft:grass_block");
        (e.target as HTMLImageElement).style.filter = "grayscale(1) opacity(0.4)";
    }

    let editModeInterval: ReturnType<typeof setInterval>;

    onMount(() => {
        window.addEventListener("storage", handleStorageChange);

        if (editMode) {
            bedStates = [
                {
                    block: "minecraft:red_bed",
                    pos: { x: 10, y: 64, z: -20 },
                    trackedBlockPos: { x: 10, y: 64, z: -20 },
                    surroundingBlocks: [],
                    compactSurroundingBlocks: [
                        { block: "minecraft:obsidian", count: 8, layer: 0 },
                        { block: "minecraft:oak_planks", count: 16, layer: 0 },
                        { block: "minecraft:white_wool", count: 24, layer: 0 },
                        { block: "minecraft:end_stone", count: 12, layer: 0 }
                    ]
                },
                {
                    block: "minecraft:blue_bed",
                    pos: { x: -45, y: 64, z: 80 },
                    trackedBlockPos: { x: -45, y: 64, z: 80 },
                    surroundingBlocks: [],
                    compactSurroundingBlocks: [
                        { block: "minecraft:white_wool", count: 10, layer: 0 },
                        { block: "minecraft:oak_trapdoor", count: 2, layer: 0 },
                        { block: "minecraft:tall_grass", count: 5, layer: 0 }
                    ]
                }
            ];
            playerPos = { x: 0, y: 64, z: 0 };
            playerYaw = 0;

            editModeInterval = setInterval(() => {
                playerYaw += 2; 
                bedStates = [...bedStates];
            }, 50);
        }
    });

    onDestroy(() => {
        window.removeEventListener("storage", handleStorageChange);
        if (editModeInterval) clearInterval(editModeInterval);
    });
</script>

<div class="bed-tracker-container" in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
    
    <div class="header">
        <img class="header-icon" src="img/hud/bedtracker/icon-bedtracker.svg" alt="bedtracker" style="filter: {iconFilter};">
        <span class="title">Bed Tracker</span>
    </div>

    <div class="beds-list">
        {#if processedBeds.length > 0}
            {#each processedBeds as bed (bed.pos.x + ',' + bed.pos.y + ',' + bed.pos.z)}
                {@const bedId = bed.pos.x + ',' + bed.pos.y + ',' + bed.pos.z}
                <div class="bed-card" transition:fade={{ duration: 200 }}>
                    
                    <div class="bed-header">
                        <div class="bed-title">
                            <img class="mc-icon" src={itemTextureUrl(bed.block)} alt="Bed" on:error={handleImageError}/>
                            <span class="bed-name">Target Bed</span>
                        </div>
                        
                        <div class="bed-stats">
                            <svg class="compass" style="transform: rotate({getArrowRotation(bedId, bed.pos, playerPos, playerYaw)}deg);" viewBox="0 0 24 24">
                                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" fill="var(--accent-color)"/>
                            </svg>

                            <div class="distance-badge">
                                <span class="val">{bed.distance.toFixed(1)}</span>
                                <span class="unit">m</span>
                            </div>
                        </div>
                    </div>

                    {#if bed.filteredBlocks.length > 0}
                        <div class="defense-container">
                            {#each bed.filteredBlocks as item}
                                <div class="defense-stack">
                                    <img class="block-icon" src={itemTextureUrl(item.block)} alt={item.block} on:error={handleImageError}/>
                                    <span class="block-count">{item.count}</span>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="no-defense">No defense detected</div>
                    {/if}

                </div>
            {/each}
        {:else}
            <div class="empty-state">
                <span class="empty-text">Enable BedPlates to see beds tracker or find a bed nearby</span>
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
    .bed-tracker-container {
        display: flex;
        flex-direction: column;
        width: 240px;
        background: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
        border-radius: 14px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        animation: popAnim 0.4s ease;
    }

    .header {
        display: flex;
        align-items: center;
        padding: 10px;

        .title {
            color: var(--clickgui-text-color);
            font-size: 16px;
            font-weight: 500;
            text-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }

        .header-icon {
            width: 16px;
            height: 16px;
            margin-right: 4px;
        }
    }

    .beds-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 0 4px;
    }

    .bed-card {
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .bed-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .bed-title {
        display: flex;
        align-items: center;
        gap: 6px;

        .mc-icon {
            width: 20px;
            height: 20px;
        }

        .bed-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--clickgui-text-color);
        }
    }

    .bed-stats {
        display: flex;
        align-items: center;
        gap: 2px;
    }

    .compass {
        width: 16px;
        height: 16px;
        transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        filter: drop-shadow(0 2px 4px color-mix(in srgb, var(--accent-color) 50%, transparent));
    }

    .distance-badge {
        display: flex;
        align-items: baseline;

        .val {
            font-size: 14px;
            font-weight: 400;
            color: var(--accent-color);
            font-variant-numeric: tabular-nums;
        }

        .unit {
            font-size: 12px;
            font-weight: 500;
            color: var(--clickgui-text-dimmed-color);
        }
    }

    .defense-container {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 0 4px 4px 4px;
    }

    .defense-stack {
        position: relative;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .block-icon {
        width: 100%;
        height: 100%;
    }

    .block-count {
        position: absolute;
        bottom: -6px;
        right: -4px;
        font-size: 12px;
        font-weight: bold;
        color: white;
        text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.5);
        font-variant-numeric: tabular-nums;
        z-index: 2;
    }

    .no-defense {
        font-size: 14px;
        color: var(--error-color, #fc4130);
        text-align: center;
        font-weight: 500;
    }

    .empty-state {
        display: flex;
        justify-content: center;
        padding: 10px;
        margin-top: -10px;
        text-align: center;
    }

    .empty-text {
        font-size: 14px;
        color: var(--clickgui-text-dimmed-color);
        font-weight: 500;
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