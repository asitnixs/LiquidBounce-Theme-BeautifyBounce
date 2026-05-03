<script lang="ts">
    import {listen} from "../../../integration/ws";
    import {fade} from "svelte/transition";
    import {itemTextureUrl} from "../../../integration/rest";
    import type {ClientPlayerDataEvent} from "../../../integration/events";

    export let settings: { [name: string]: any };

    let currentBlockId: string | undefined = undefined;
    let count: number = 0;

    export let editMode = false;
    
    let scaffoldActive = false;
    let scaffoldTimeout: ReturnType<typeof setTimeout> | null = null;

    let blockColor = "var(--accent-color)";

    async function sampleBlockColor(identifier: string) {
        try {
            const url = itemTextureUrl(identifier);
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = url;
            await new Promise(r => { img.onload = r; img.onerror = r; });

            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth || 16;
            canvas.height = img.naturalHeight || 16;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0);

            const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let r = 0, g = 0, b = 0, total = 0;
            for (let i = 0; i < d.length; i += 4) {
                if (d[i + 3] < 128) continue; 
                r += d[i]; g += d[i + 1]; b += d[i + 2]; total++;
            }
            if (total > 0) {
                blockColor = `rgb(${Math.round(r/total)}, ${Math.round(g/total)}, ${Math.round(b/total)})`;
            }
        } catch {
            blockColor = "var(--accent-color)";
        }
    }

    const NON_BLOCK_KEYWORDS = [
        "sword", "pickaxe", "axe", "shovel", "hoe", "helmet", "chestplate", 
        "leggings", "boots", "potion", "apple", "beef", "porkchop", "chicken",
        "mutton", "fish", "bread", "cookie", "melon", "carrot", "potato", "stew",
        "soup", "bow", "arrow", "trident", "crossbow", "shield", "totem", "bucket",
        "ender_pearl", "eye_of_ender", "snowball", "egg", "compass", "clock",
        "fishing_rod", "lead", "name_tag", "saddle", "minecart", "boat", "flint",
        "shears", "stick", "string", "feather", "gunpowder", "wheat", "seeds",
        "dye", "ingot", "nugget", "gem", "diamond", "emerald", "coal", "lapis",
        "redstone", "dust", "book", "paper", "map", "record", "music_disc"
    ];

    function isBuildableBlock(identifier: string): boolean {
        if (!identifier || identifier === "minecraft:air") return false;
        const id = identifier.toLowerCase();
        for (const keyword of NON_BLOCK_KEYWORDS) {
            if (id.includes(keyword)) return false;
        }
        return true;
    }

    listen("blockCountChange", (data) => {
        if (editMode) return;

        if (data.count !== undefined) {
            scaffoldActive = true;
            if (scaffoldTimeout) clearTimeout(scaffoldTimeout);
            scaffoldTimeout = setTimeout(() => {
                scaffoldActive = false;
            }, 1000);
        }
    });

    listen("clientPlayerData", (data: ClientPlayerDataEvent) => {
        if (editMode) return;

        const mainHand = data.playerData.mainHandStack;
        
        if (!mainHand || !isBuildableBlock(mainHand.identifier) || mainHand.count <= 0) {
            count = 0;
            return;
        }

        count = mainHand.count;

        if (mainHand.identifier !== currentBlockId) {
            currentBlockId = mainHand.identifier;
            sampleBlockColor(currentBlockId);
        }
    });

    const MAX_DISPLAY_BLOCKS = 64;
    $: progressPercent = count > 0 ? (count / MAX_DISPLAY_BLOCKS) * 100 : 0;

    $: if (editMode) {
        scaffoldActive = true;
        count = 32;
        currentBlockId = "minecraft:oak_planks";
        blockColor = "#a08150";
    }

</script>

{#if scaffoldActive && count > 0 && currentBlockId}
    <div class="block-counter-container" in:fade={{ duration: 300 }} out:fade={{ duration: 300 }}>
        
        <div class="icon-wrapper" style="background-color: color-mix(in srgb, {blockColor} 40%, transparent); box-shadow: 0 0 12px color-mix(in srgb, {blockColor} 40%, transparent);">
            <img class="mc-icon" src={itemTextureUrl(currentBlockId)} alt={currentBlockId}/>
        </div>

        <div class="progress-wrapper">
            <div class="progress-bar" style="background-color: color-mix(in srgb, {blockColor} 40%, transparent); box-shadow: 0 0 12px color-mix(in srgb, {blockColor} 40%, transparent);">
                <div class="progress-fill" style="width: {progressPercent}%; background-color: {blockColor}; box-shadow: 0 0 8px color-mix(in srgb, {blockColor} 60%, transparent);"></div>
            </div>
        </div>

        <div class="text-wrapper">
            <div class="main-info">
                <span class="count" style="color: {blockColor}; text-shadow: 0 0 8px color-mix(in srgb, {blockColor} 60%, transparent);">{count}</span>
                <span class="label" style="text-shadow: 0 0 8px color-mix(in srgb, var(--clickgui-text-color) 40%, transparent);" >blocks</span>
            </div>
        </div>
        
    </div>
{/if}

<style lang="scss">
  .block-counter-container {
    display: flex;
    align-items: center;
    gap: 16px;
    background-color: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
    border-radius: 14px;
    padding: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    width: max-content;
  }

  .icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background-color 0.4s ease, box-shadow 0.4s ease;
  }

  .mc-icon {
    width: 24px;
    height: 24px;
  }

  .progress-wrapper {
    width: 140px;
    display: flex;
    align-items: center;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    border-radius: 8px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 8px;
    transition: width 0.4s ease, background-color 0.4s ease, box-shadow 0.4s ease;
  }

  .text-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
  }

  .main-info {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .count {
    font-size: 20px;
    font-weight: 500; 
    font-variant-numeric: tabular-nums; 
    transition: color 0.4s ease;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  }

  .label {
    font-size: 16px;
    font-weight: 500;
    color: var(--clickgui-text-color); 
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  }

  .block-counter-container {
    animation: popAnim 0.4s ease;
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