<script lang="ts">
    import LiquidBounceLogo from "../../../components/LiquidBounceLogo.svelte";
</script>

<div class="watermark">
    <LiquidBounceLogo
        width="150px"
        height="auto"
        badgeFill="var(--accent-color)"
    />
</div>

<style lang="scss">
    .watermark {
        position: relative;
        padding: 8px 10px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
</style>