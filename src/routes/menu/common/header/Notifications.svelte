<script lang="ts">
    import {fly} from "svelte/transition";
    import {notification, type TNotification} from "./notification_store";
    import {onMount} from "svelte";

    interface NotificationWithId {
        notification: TNotification;
        id: number;
    }

    let notifications: NotificationWithId[] = [];

    onMount(() => {
       notifications = [];
    });

    notification.subscribe((v) => {
        if (!v) return;
        const id = Date.now();
        const n = { notification: v, id };
        notifications = [...notifications, n];
        setTimeout(() => {
            notifications = notifications.filter(n => n.id !== id);
        }, (v?.delay ?? 3) * 1000);
    });
</script>

<div class="notifications">
    {#each notifications as n (n.id)}
        <div class="notification" transition:fly|global={{duration: 500, y: -50}}>
            <div class="icon" class:error={n.notification.error}>
                <img src="img/hud/notification/icon-info.svg" alt="info">
            </div>
            <div class="text-content">
                <div class="title">{n.notification.title}</div>
                <div class="message">{n.notification.message}</div>
            </div>
        </div>
    {/each}
</div>

<style lang="scss">
  .notifications {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 50px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    z-index: 50;
  }

  .notification {
    grid-row-start: 1;
    grid-column-start: 1;
    background: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    padding: 10px;
    min-width: 300px;
    gap: 8px;

    .text-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .title {
      color: var(--clickgui-text-color);
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 2px;
    }

    .message {
      color: var(--clickgui-text-dimmed-color);
      font-weight: 400;
      font-size: 12px;
    }

    .icon {
      height: 44px;
      width: 44px;
      border-radius: 12px;
      background-color: var(--accent-color);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      img {
        width: 20px;
        height: 20px;
      }

      &.error {
        background-color: var(--error-color);
      }
    }
  }
</style>