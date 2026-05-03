<script lang="ts">
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { getClientInfo, getSession, browse } from "../../integration/rest";
    import type { ClientInfo, Session } from "../../integration/types";

    export let onClose: () => void;
    export let iconFilter: string = "none";

    let clientInfo: ClientInfo | null = null;
    let session: Session | null = null;

    onMount(async () => {
        [clientInfo, session] = await Promise.all([
            getClientInfo(),
            getSession()
        ]);
    });

    const socials = [
        { label: "Website", icon: "liquidbounce.net", target: "CLIENT_WEBSITE" },
        { label: "GitHub",  icon: "github",           target: "MAINTAINER_GITHUB" },
        { label: "Discord", icon: "discord",          target: "MAINTAINER_DISCORD" },
        { label: "Forum",   icon: "nodebb",            target: "MAINTAINER_FORUM" },
        { label: "Twitter", icon: "twitter",           target: "MAINTAINER_TWITTER" },
        { label: "YouTube", icon: "youtube",           target: "MAINTAINER_YOUTUBE" },
    ];
</script>

<div class="about-popup" transition:fade={{ duration: 150 }}>
    <div class="popup-header">
        <span class="popup-title">LiquidBounce</span>
        <span class="desc">LiquidBounce is a utility mod for Minecraft and designed to give you a significant advantage over other players. Unlike many of its competitors, LiquidBounce is completely open-source and compatible with Fabric.</span>
    </div>

    {#if clientInfo}
        <div class="section">
            <div class="info-row">
                <span class="key">Version</span>
                <span class="val">{clientInfo.clientVersion}</span>
            </div>
            <div class="info-row">
                <span class="key">Build</span>
                <span class="val" class:dev={clientInfo.development}>
                    {clientInfo.development ? "Dev" : "Release"}
                </span>
            </div>
        </div>
    {/if}

    {#if session}
        <div class="section">
            <div class="section-label">Session</div>
            <div class="session-row">
                <img class="avatar" src="https://mc-heads.net/avatar/{session.uuid}/24" alt="avatar" />
                <div>
                    <div class="session-name">{session.username}</div>
                    <div class="session-type" class:online={session.online}>{session.service}</div>
                </div>
            </div>
        </div>
    {/if}

    <div class="section">
        <div class="section-label">Links</div>
        <div class="socials-row">
            {#each socials as s}
                <button class="social-btn" onclick={() => browse(s.target)} title={s.label}>
                    <img src="img/menu/icon-{s.icon}.svg" alt={s.label} style="filter: {iconFilter};" />
                </button>
            {/each}
        </div>
    </div>
</div>

<style lang="scss">
    .about-popup {
        position: absolute;
        top: 0;
        right: calc(100% + 10px);
        width: 300px;
        background: var(--clickgui-base-color);
        border-radius: 14px;
        padding: 14px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .popup-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding-bottom: 10px;
    }

    .popup-title {
        color: var(--clickgui-text-color);
        font-size: 20px;
        font-weight: 500;
    }

    .desc {
        color: var(--clickgui-text-dimmed-color);
        font-size: 14px;
        font-weight: 400;
    }
    
    .section {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .section-label {
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--clickgui-text-dimmed-color);
        opacity: 0.7;
    }

    .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .key {
        font-size: 12px;
        color: var(--clickgui-text-dimmed-color);
    }

    .val {
        font-size: 12px;
        font-weight: 400;
        color: var(--clickgui-text-color);

        &.dev { color: #efbf04; }
    }

    .session-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background: var(--clickgui-window-background-color);
        border-radius: 8px;
    }

    .avatar {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        image-rendering: pixelated;
        flex-shrink: 0;
    }

    .session-name {
        font-size: 12px;
        font-weight: 400;
        color: var(--clickgui-text-color);
    }

    .session-type {
        font-size: 12px;
        color: var(--clickgui-text-dimmed-color);

        &.online { color: #4dac68; }
    }

    .socials-row {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }

    .social-btn {
        width: 40px;
        height: 40px;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.4s;

        img {
            width: 24px;
            height: 24px;
            opacity: 0.4;
            transition: opacity 0.4s;
        }

        &:hover {
            background-color: color-mix(in srgb, var(--accent-color) 40%, transparent);
            img { opacity: 1; }
        }
    }

    .about-popup {
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