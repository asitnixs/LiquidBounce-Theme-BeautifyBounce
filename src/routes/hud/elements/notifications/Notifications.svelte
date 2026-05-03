<script lang="ts">
    import {flip} from "svelte/animate";
    import {listen} from "../../../../integration/ws";
    import {fly} from "svelte/transition";
    import Notification from "./Notification.svelte";
    import type {NotificationEvent} from "../../../../integration/events";

    export let editMode = false;

    interface TNotification {
        animationKey: number;
        id: number;
        title: string;
        severity: string;
        message: string;
    }

    let notifications: TNotification[] = [];

    function addNotification(title: string, message: string, severity: string) {
        if (editMode) return;

        let animationKey = Date.now();
        const id = animationKey;

        if (severity === "ENABLED" || severity === "DISABLED") {
            [title, message] = [message, severity === "ENABLED" ? "Module enabled." : "Module disabled."];
        }

        if (severity === "ENABLED" || severity === "DISABLED") {
            const index = notifications.findIndex((n) => n.title === title && (n.severity === "ENABLED" || n.severity === "DISABLED"));
            if (index !== -1) {
                animationKey = notifications[index].animationKey;
                notifications.splice(index, 1);
            }
        }

        notifications = [
            {animationKey, id, title, message, severity},
            ...notifications,
        ];
        
        setTimeout(() => {
            notifications = notifications.filter((n) => n.id !== id);
        }, 1500);
    }

    listen("notification", (e: NotificationEvent) => {
        if (editMode) return;
        addNotification(e.title, e.message, e.severity);
    });

    $: if (editMode && notifications.length === 0) {
        notifications = [
            { animationKey: 1, id: 1, title: "KillAura", message: "Module enabled.", severity: "ENABLED" },
            { animationKey: 2, id: 2, title: "Fly", message: "Module Locked", severity: "ERROR" },
            { animationKey: 3, id: 3, title: "Staff Alert", message: "Staff are watching", severity: "INFO" }
        ];
    }
</script>

<div class="notifications">
    {#each notifications as {title, message, severity, animationKey} (animationKey)}
        <div
                animate:flip={{ duration: 300 }}
                in:fly={{ x: 30, duration: 300 }}
                out:fly={{ x: 30, duration: 300 }}
        >
            <Notification {title} {message} {severity}/>
        </div>
    {/each}
</div>

<style lang="scss">

    .notifications {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
</style>
