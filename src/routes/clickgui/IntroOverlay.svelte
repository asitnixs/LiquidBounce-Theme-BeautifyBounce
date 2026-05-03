<script lang="ts">
    import { onMount } from "svelte";
    import LiquidBounceLogo from "../../components/LiquidBounceLogo.svelte";
    import { getSavedTheme } from "../../theme/clickgui_theme";

    const INTRO_KEY = "liquidbounce_intro_shown";

    let visible = $state(false);
    let leaving = $state(false);

    onMount(() => {
        if (localStorage.getItem(INTRO_KEY)) return;
        visible = true;

        setTimeout(() => {
            leaving = true;
        }, 4000);

        setTimeout(() => {
            visible = false;
            localStorage.setItem(INTRO_KEY, "1");
        }, 5200);
    });
</script>

{#if visible}
    <div class="intro" class:leaving>
        <div class="content">
            <div class="logo">
                <LiquidBounceLogo
                    width="220px"
                    height="auto"
                    badgeFill="var(--accent-color)"
                />
            </div>
            <p class="subtitle">Bouncy :3</p>
            <div class="bar">
                <div class="bar-fill"></div>
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    .intro {
        position: absolute;
        inset: 0;
        z-index: 999999;
        border-radius: 14px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--clickgui-window-background-color);
        animation: fade-in 0.8s ease forwards;

        &.leaving {
            animation: fade-out 1.2s ease forwards;
        }
    }

    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
    }

    .logo {
        opacity: 0;
        animation: fade-in 0.7s ease 0.4s forwards;
    }

    .subtitle {
        color: var(--clickgui-text-dimmed-color);
        font-size: 18px;
        font-weight: 400;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        opacity: 0;
        animation: fade-in 0.7s ease 0.7s forwards;
    }

    .bar {
        width: 200px;
        height: 4px;
        background: rgba(35, 35, 35, 0.5);
        border-radius: 10px;
        overflow: hidden;
        opacity: 0;
        animation: fade-in 0.5s ease 1s forwards;
    }

    .bar-fill {
        height: 100%;
        background: var(--accent-color);
        border-radius: 10px;
        width: 0%;
        animation: bar-grow 3.2s cubic-bezier(0.4, 0, 0.2, 1) 1s forwards;
    }

    @keyframes fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
    }

    @keyframes fade-out {
        from { opacity: 1; }
        to   { opacity: 0; }
    }

    @keyframes bar-grow {
        from { width: 0%; }
        to   { width: 100%; }
    }
</style>