<script lang="ts">
    import MainButton from "./buttons/MainButton.svelte";
    import IconButton from "../common/buttons/IconButton.svelte";
    import IconTextButton from "../common/buttons/IconTextButton.svelte";
    import ButtonContainer from "../common/buttons/ButtonContainer.svelte";
    import Account from "../common/header/account/Account.svelte";
    import Notifications from "../common/header/Notifications.svelte";
    import {
        browse, exitClient, getClientUpdate, openScreen
    } from "../../../integration/rest";
    import { fly, fade } from "svelte/transition";
    import { backIn, backOut } from "svelte/easing";
    import { onDestroy, onMount } from "svelte";
    import { notification } from "../common/header/notification_store";
    import LiquidBounceLogo from "../../../components/LiquidBounceLogo.svelte";

    let regularButtonsShown = true;
    let clientButtonsShown = false;
    let ready = false;

    let hours = "00";
    let minutes = "00";
    let dateStr = "";
    let clockTimer: ReturnType<typeof setInterval>;

    function updateClock() {
        const now = new Date();
        hours   = String(now.getHours()).padStart(2, "0");
        minutes = String(now.getMinutes()).padStart(2, "0");
        dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    }

    let bgX = 0;
    let bgY = 0;
    let mouseX = 0;
    let mouseY = 0;

    function handleMouseMove(e: MouseEvent) {
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        bgX = ((e.clientX - cx) / cx) * -20;
        bgY = ((e.clientY - cy) / cy) * -20;
    }

    onMount(() => {
        setTimeout(() => { ready = true; }, 100);
        setTimeout(async () => {
            const clientUpdate = await getClientUpdate();
            if (clientUpdate.update) {
                notification.set({
                    title: `LiquidBounce ${clientUpdate.update.clientVersion} has been released!`,
                    message: `Download it from liquidbounce.net!`,
                    error: false,
                    delay: 99999999
                });
            }
        }, 2000);
    });

    onMount(() => {
        updateClock();
        clockTimer = setInterval(updateClock, 1000);

        setTimeout(async () => {
            const upd = await getClientUpdate();
            if (upd.update) {
                notification.set({
                    title: `LiquidBounce ${upd.update.clientVersion} has been released!`,
                    message: "Download it from liquidbounce.net!",
                    error: false,
                    delay: 99999999
                });
            }
        }, 2000);
    });

    onDestroy(() => {
        clearInterval(clockTimer);
    });

    function onMouseMove(e: MouseEvent) {
        handleMouseMove(e);
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    function toggleButtons() {
        if (clientButtonsShown) {
            clientButtonsShown = false;
            setTimeout(() => { regularButtonsShown = true; }, 400);
        } else {
            regularButtonsShown = false;
            setTimeout(() => { clientButtonsShown = true; }, 400);
        }
    }
</script>

<div class="title-screen" on:mousemove={onMouseMove}>

    <div class="bg-parallax"
         style="transform: translate({bgX}px, {bgY}px) scale(1.08);">
    </div>
    <div class="bg-overlay"></div>

    {#if ready}
        <div class="left-panel" in:fly={{ x: -60, duration: 600, easing: backOut }}>

            <div class="panel-top">
                <div class="logo">
                    <LiquidBounceLogo
                        width="160px"
                        height="80px"
                        badgeFill="var(--accent-color)"
                    />
                </div>
            </div>

            <nav class="nav">
                <div class="clock" in:fly={{ y: -20, duration: 500, easing: backOut, delay: 100 }}>
                    <div class="clock-time">
                        <span class="clock-h">{hours}</span>
                        <span class="clock-sep">:</span>
                        <span class="clock-m">{minutes}</span>
                    </div>
                    <div class="clock-date">{dateStr}</div>
                </div>

                {#if regularButtonsShown}
                    <MainButton title="Singleplayer" icon="singleplayer" index={0}
                                on:click={() => openScreen("singleplayer")}/>
                    <MainButton title="Multiplayer"  icon="multiplayer"  index={1}
                                on:click={() => openScreen("multiplayer")}/>
                    <MainButton title="LiquidBounce" icon="liquidbounce" index={2}
                                on:click={toggleButtons}/>
                    <MainButton title="Options"      icon="options"      index={3}
                                on:click={() => openScreen("options")}/>
                {:else if clientButtonsShown}
                    <MainButton title="Proxy Manager" icon="proxymanager" index={0}
                                on:click={() => openScreen("proxymanager")}/>
                    <MainButton title="Click GUI"     icon="clickgui"     index={1}
                                on:click={() => openScreen("clickgui")}/>
                    <MainButton title="Back"          icon="back-large"   index={2}
                                on:click={toggleButtons}/>
                {/if}
            </nav>

            <div class="panel-bottom">
                <button class="exit-btn" on:click={exitClient}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Exit
                </button>
            </div>
        </div>

        <div class="top-right" in:fly={{ y: -40, duration: 600, easing: backOut }}>
            <Account />
        </div>

        <Notifications />

        <div class="social-bar" in:fly={{ y: 40, duration: 600, easing: backOut }}>
            <ButtonContainer>
                <IconButton title="Forum"   icon="nodebb"   on:click={() => browse("MAINTAINER_FORUM")}/>
                <IconButton title="GitHub"  icon="github"   on:click={() => browse("MAINTAINER_GITHUB")}/>
                <IconButton title="Discord" icon="discord"  on:click={() => browse("MAINTAINER_DISCORD")}/>
                <IconButton title="Twitter" icon="twitter"  on:click={() => browse("MAINTAINER_TWITTER")}/>
                <IconButton title="YouTube" icon="youtube"  on:click={() => browse("MAINTAINER_YOUTUBE")}/>
                <IconTextButton title="liquidbounce.net" icon="icon-liquidbounce.net.svg"
                                on:click={() => browse("CLIENT_WEBSITE")}/>
            </ButtonContainer>
        </div>
    {/if}
</div>

<style lang="scss">
    .title-screen {
        position: fixed;
        inset: 0;
        overflow: hidden;
    }

    .bg-parallax {
        position: absolute;
        inset: -5%;
        background: url("img/menu/background.png") center / cover no-repeat;
        transition: transform 0.2s ease-out;
        z-index: 0;
        will-change: transform;
    }

    .bg-overlay {
        position: absolute;
        inset: 0;
        z-index: 1;
        background:
            linear-gradient(to right,
                rgba(0,0,0,0.75) 0%,
                rgba(0,0,0,0.50) 40%,
                rgba(0,0,0,0.10) 100%),
            linear-gradient(to bottom,
                rgba(0,0,0,0.25) 0%,
                transparent 25%,
                transparent 75%,
                rgba(0,0,0,0.35) 100%);
    }

    .left-panel {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 360px;
        z-index: 10;
        display: flex;
        flex-direction: column;
        padding: 40px;
        gap: 0;

        &::after {
            content: '';
            position: absolute;
            right: 0;
            top: 5%;
            bottom: 5%;
            width: 2px;
            background: linear-gradient(
                to bottom,
                transparent,
                rgba(255,255,255,0.08) 30%,
                rgba(255,255,255,0.08) 70%,
                transparent
            );
        }
    }

    .logo {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        margin-left: 40px;
    }

    .nav {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        justify-content: center;
    }

    .clock {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        user-select: none;
    }

    .clock-time {
        display: flex;
        align-items: baseline;
        gap: 2px;
    }

    .clock-h, .clock-m {
        font-size: 50px;
        font-weight: 500;
        color: rgba(255,255,255,1);
        line-height: 1;
        font-variant-numeric: tabular-nums;
    }

    .clock-sep {
        font-size: 40px;
        font-weight: 200;
        color: var(--accent-color);
        margin: 0 1px;
        line-height: 1;
    }

    .clock-date {
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 2.5px;
        text-transform: uppercase;
        color: rgba(255,255,255,0.35);
        margin-bottom: 10px;
    }

    .panel-bottom {
        margin-top: 40px;
    }

    .exit-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--clickgui-base-color);
        border: 1px solid transparent;
        border-radius: 14px;
        padding: 10px 16px;
        color: var(--clickgui-text-dimmed-color);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.4s ease;
        width: 75%;

        svg {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
        }

        &:hover {
            background: rgba(220, 50, 50, 0.12);
            color: #ff6b6b;
        }
    }

    .top-right {
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 10;
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .social-bar {
        position: absolute;
        bottom: 20px;
        right: 20px;
        z-index: 10;
    }
</style>