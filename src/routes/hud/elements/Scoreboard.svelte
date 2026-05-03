<script lang="ts">
    import {listen} from "../../../integration/ws";
    import type {PlayerData, Scoreboard} from "../../../integration/types";
    import TextComponent from "../../menu/common/TextComponent.svelte";
    import type {ClientPlayerDataEvent} from "../../../integration/events";

    export let settings: { [name: string]: any };
    
    export let editMode = false;

    const cSettings = settings as HudScoreboardSettings;

    let scoreboard: Scoreboard | null = null;
    let realScoreboard: Scoreboard | null = null;

    listen("clientPlayerData", (e: ClientPlayerDataEvent) => {
        const playerData: PlayerData = e.playerData;
        realScoreboard = playerData.scoreboard;
    });

    $: {
        if (realScoreboard && realScoreboard.entries && realScoreboard.entries.length > 0) {
            scoreboard = realScoreboard;
        } else if (editMode) {
            scoreboard = {
                header: { text: "CCBlueX Test Server", color: "#fff", bold: true },
                entries: [
                    { name: { text: "Kills:", color: "white" }, score: { text: "123", color: "gold" } },
                    { name: { text: "Deaths:", color: "white" }, score: { text: "456", color: "red" } },
                    { name: { text: "Ping:", color: "white" }, score: { text: "1", color: "green" } },
                    { name: { text: "Role:", color: "white" }, score: { text: "Admin", color: "dark_red" } }
                ]
            };
        } else {
            scoreboard = null;
        }
    }
</script>

{#if scoreboard}
    <div class="scoreboard">
        {#if scoreboard.header && cSettings.show.includes('Header')}
            <div class="header">
                <TextComponent fontSize={14} allowPreformatting={true} textComponent={scoreboard.header}/>
            </div>
        {/if}
        <div class="entries">
            {#each scoreboard.entries as {name, score}}
                <div class="row">
                    {#if cSettings.show.includes('Name')}
                        <TextComponent fontSize={14} allowPreformatting={true} textComponent={name}/>
                    {/if}
                    {#if cSettings.show.includes('Score')}
                        <TextComponent fontSize={14} allowPreformatting={true} textComponent={score}/>
                    {/if}
                </div>
            {/each}
        </div>
    </div>
{/if}

<style lang="scss">

  .scoreboard {
    width: max-content;
    border-radius: 12px;
    overflow: hidden;
    font-size: 14px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    background-color: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
    animation: popAnim 0.4s ease;
  }

  .entries {
    padding: 2px 10px 8px 10px;
  }

  .row {
    display: flex;
    column-gap: 14px;
    justify-content: space-between;
  }

  .header {
    text-align: center;
    padding: 6px 10px;
    text-shadow: 0 0 8px color-mix(in srgb, var(--clickgui-text-color) 40%, transparent);
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
