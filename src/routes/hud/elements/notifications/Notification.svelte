<script lang="ts">

    export let title: string;
    export let message: string;
    export let severity: string;

</script>

<div class="notification">
    <div class="icon {severity.toLowerCase()}"></div>
    <div class="content">
        <div class="title">{title}</div>
        <div class="message">{message}</div>
    </div>
</div>

<style lang="scss">

.notification {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 240px;
    padding: 10px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    overflow: hidden;
}

.icon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &::before {
        content: "";
        width: 18px;
        height: 18px;
        mask-size: contain;
        mask-repeat: no-repeat;
        mask-position: center;
        background: var(--accent-color);
    }

    &.success {
        background: color-mix(in srgb, var(--accent-color) 10%, transparent);
        box-shadow: 0 0 8px color-mix(in srgb, var(--accent-color) 40%, transparent);

        &::before {
            mask-image: url("/img/hud/notification/icon-success.svg");
        }
    }

    &.error {
        background: color-mix(in srgb, var(--accent-color) 10%, transparent);
        box-shadow: 0 0 8px color-mix(in srgb, var(--accent-color) 40%, transparent);

        &::before {
            mask-image: url("/img/hud/notification/icon-error.svg");
        }
    }

    &.info {
        background: color-mix(in srgb, var(--accent-color) 10%, transparent);
        box-shadow: 0 0 8px color-mix(in srgb, var(--accent-color) 40%, transparent);

        &::before {
            mask-image: url("/img/hud/notification/icon-info.svg");
        }
    }

    &.enabled {
        background: color-mix(in srgb, var(--accent-color) 10%, transparent);
        box-shadow: 0 0 8px color-mix(in srgb, var(--accent-color) 40%, transparent);

        &::before {
            mask-image: url("/img/hud/notification/icon-success.svg");
        }
    }

    &.disabled {
        background: color-mix(in srgb, var(--accent-color) 10%, transparent);
        box-shadow: 0 0 8px color-mix(in srgb, var(--accent-color) 40%, transparent);

        &::before {
            mask-image: url("/img/hud/notification/icon-error.svg");
        }
    }
}

.content {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.title {
    font-size: 14px;
    font-weight: 500;
    color: var(--clickgui-text-color);
    text-shadow: 0 0 8px color-mix(in srgb, var(--clickgui-text-color) 40%, transparent);
}

.message {
    font-size: 12px;
    font-weight: 400;
    color: var(--clickgui-text-dimmed-color);
    text-shadow: 0 0 8px color-mix(in srgb, var(--clickgui-text-dimmed-color) 40%, transparent);
}
</style>