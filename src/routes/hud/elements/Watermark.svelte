<script lang="ts">
    import { onDestroy, onMount } from "svelte";


    let timeString = "00:00:00";
    let updateInterval: ReturnType<typeof setInterval>;

    onMount(async () => {
        updateInterval = setInterval(async () => {
            const date = new Date();
            timeString = date.toLocaleTimeString('ru-RU'); 
        }, 1000);
    });

    onDestroy(() => {
        if (updateInterval) clearInterval(updateInterval);
    });

</script>

<div class="watermark">
    <svg class="logo" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <path d="M79.9,39.948A39.967,39.967,0,0,0,39.947,0H0V39.948a39.948,39.948,0,1,0,79.9,0Z" fill="var(--accent-color)" />
    </svg>

    <span class="client-name">LB</span>

    <span class="separator"></span>
    
    <span class="info">{timeString}</span>
</div>

<style lang="scss">
    .watermark {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        width: max-content;
    }

    .logo {
        width: 24px;
        height: 24px;
        filter: drop-shadow(0 0 6px color-mix(in srgb, var(--accent-color) 40%, transparent));
    }

    .client-name {
        color: var(--clickgui-text-color);
        font-size: 18px;
        font-weight: 500;
    }

    .info {
        color: var(--clickgui-text-dimmed-color);
        font-weight: 400;
        font-size: 16px;
        font-variant-numeric: tabular-nums;
    }

    .separator {
        width: 2px;
        height: 12px;
        background-color: var(--clickgui-text-dimmed-color);
        opacity: 0.4;
    }

    @keyframes pulse-glow {
        0% { box-shadow: 0 0 0px color-mix(in srgb, var(--accent-color) 0%, transparent); }
        100% { box-shadow: 0 0 12px color-mix(in srgb, var(--accent-color) 40%, transparent); }
    }
</style>