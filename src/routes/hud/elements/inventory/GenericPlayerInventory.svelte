<script lang="ts">
    import type {ItemStack} from "../../../../integration/types";
    import {listen} from "../../../../integration/ws";
    import type {ClientPlayerInventoryEvent, PlayerInventory} from "../../../../integration/events";
    import ItemStackView from "./ItemStackView.svelte";
    import {onMount} from "svelte";
    import {getPlayerInventory} from "../../../../integration/rest";

    export let rowLength: number;
    export let gap: string = "4px";
    export let getRenderedStacks: (inventory: PlayerInventory) => ItemStack[];

    let stacks: ItemStack[] = [];

    listen("clientPlayerInventory", (data: ClientPlayerInventoryEvent) => {
        stacks = getRenderedStacks(data.inventory);
    });

    onMount(async () => {
        const inventory = await getPlayerInventory();
        stacks = getRenderedStacks(inventory);
    });
</script>

<div class="inventory-container" style="gap: {gap}; --row-length: {rowLength};">
    {#each stacks as stack (stack)}
        <div class="slot">
            <ItemStackView {stack}/>
        </div>
    {/each}
</div>

<style lang="scss">
    .inventory-container {
        display: grid;
        grid-template-columns: repeat(var(--row-length), max-content);
        padding: 8px;
        border-radius: 12px;
        width: max-content;
        background: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }

    .slot {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--clickgui-window-background-color) 80%, transparent); 
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>