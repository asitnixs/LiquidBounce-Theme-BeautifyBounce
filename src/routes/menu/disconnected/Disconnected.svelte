<script lang="ts">
    import {
        directLoginToCrackedAccount,
        getAccounts,
        loginToAccount,
        randomUsername,
        reconnectToServer,
        restoreSession
    } from "../../../integration/rest";
    import {listen} from "../../../integration/ws";
    import {onMount} from "svelte";
    import type {Account} from "../../../integration/types";
    import {isLoggingIn} from "../altmanager/altmanager_store";
    import {fly} from "svelte/transition";

    const premiumAccounts: Account[] = $state([]);

    async function reconnectWithRandomUsername() {
        const username = await randomUsername();
        await directLoginToCrackedAccount(username, false);
    }

    async function reconnectWithRandomAccount() {
        const account = premiumAccounts[Math.floor(Math.random() * premiumAccounts.length)];
        await loginToAccount(account.id);
    }

    onMount(async () => {
        const accounts = await getAccounts();
        premiumAccounts.push(...accounts.filter(a => a.type !== "Cracked" && !a.favorite));
    });

    listen("accountManagerLogin", reconnectToServer);
</script>

<div class="disconnect-panel" transition:fly|global={{ y: 50, duration: 600, easing: (t) => 1 - Math.pow(1 - t, 4) }}>
    <div class="panel-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="header-icon"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        <span>Connection Lost</span>
    </div>

    <div class="buttons-grid">
        <button class="btn primary" on:click={reconnectToServer} disabled={$isLoggingIn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
            Reconnect
        </button>

        <button class="btn secondary" on:click={restoreSession} disabled={$isLoggingIn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Restore Session
        </button>

        <button class="btn outline" on:click={reconnectWithRandomAccount} disabled={premiumAccounts.length === 0 || $isLoggingIn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Random Alt
        </button>

        <button class="btn outline" on:click={reconnectWithRandomUsername} disabled={$isLoggingIn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Random Name
        </button>
    </div>
</div>

<style lang="scss">
  .disconnect-panel {
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--clickgui-base-color);
    border-radius: 20px;
    padding: 20px 24px;
    width: max-content;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    gap: 16px;
    z-index: 100;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--error-color, #fc4130);
    font-size: 16px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--clickgui-border-color);

    .header-icon {
        width: 18px;
        height: 18px;
    }
  }

  .buttons-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: none;
    border-radius: 12px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    
    svg {
        width: 16px;
        height: 16px;
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
    }

    &.primary {
        background: color-mix(in srgb, var(--accent-color) 80%, transparent);
        color: var(--clickgui-text-color);

        &:not(:disabled):hover {
            transform: translateY(-1px);
            box-shadow: 0 0 12px color-mix(in srgb, var(--accent-color) 40%, transparent);
        }
    }

    &.secondary {
        background: var(--clickgui-window-background-color);
        color: var(--clickgui-text-color);

        &:not(:disabled):hover {
            background: color-mix(in srgb, var(--accent-color) 40%, transparent);
            transform: translateY(-1px);
        }
    }

    &.outline {
        background: transparent;
        border: 1px solid var(--clickgui-border-color);
        color: var(--clickgui-text-dimmed-color);

        &:not(:disabled):hover {
            border-color: color-mix(in srgb, var(--accent-color) 60%, transparent);
            color: var(--clickgui-text-color);
        }
    }
  }
</style>