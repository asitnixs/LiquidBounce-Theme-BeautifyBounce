<script lang="ts">
    import ToolTip from "../../ToolTip.svelte";
    import {
        directLoginToCrackedAccount, getAccounts, getSession, loginToAccount, openScreen, randomUsername
    } from "../../../../../integration/rest";
    import {onMount} from "svelte";
    import {listen} from "../../../../../integration/ws";
    import {location} from "svelte-spa-router";
    import {quintOut} from "svelte/easing";
    import {fade, slide} from "svelte/transition";
    import type {Account} from "../../../../../integration/types";
    import Avatar from "./Avatar.svelte";
    import {notification} from "../notification_store";
    import RippleLoader from "../../RippleLoader.svelte";
    import {isLoggingIn} from "../../../altmanager/altmanager_store";
    import { getSavedTheme } from "../../../../../theme/clickgui_theme";

    let activeTheme = getSavedTheme();
    $: iconFilter = activeTheme === "light" ? "brightness(0)" : "none";

    let username = "";
    let service = "";
    let avatar = "";
    let online = true;

    let expanded = false;
    let accountElement: HTMLElement;
    let headerElement: HTMLElement;

    let searchQuery = "";
    let accounts: Account[] = [];

    $: renderedAccounts = accounts.filter(a => a.username.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery === "");

    const inAccountManager = $location === "/altmanager";
    const inTitle = $location === "/title";

    async function refreshSession() {
        const session = await getSession();
        username = session.username;
        service = session.service;
        avatar = session.avatar;
        online = session.online;
    }

    async function refreshAccounts() {
        accounts = await getAccounts();
    }

    onMount(async () => {
        await refreshSession();
        await refreshAccounts();
    });

    listen("session", async () => { await refreshSession(); });
    listen("accountManagerRemoval", async () => { await refreshAccounts(); });
    listen("accountManagerAddition", async () => { await refreshAccounts(); });

    function handleWindowClick(e: MouseEvent) {
        if (!accountElement.contains(e.target as Node)) {
            expanded = false;
            searchQuery = "";
        }
    }

    function handleSelectClick(e: MouseEvent) {
        if (!expanded) {
            expanded = !(e.target as HTMLElement).classList.contains("icon-button") && !(e.target as HTMLElement).closest(".icon-button");
        } else {
            expanded = !headerElement.contains(e.target as Node);
        }

        if (!expanded) {
            searchQuery = "";
        }
    }

    async function login(account: Account) {
        notification.set({ title: "AltManager", message: "Logging in...", error: false });
        await loginToAccount(account.id);
    }

    async function loginWithRandomUsername() {
        const uname = await randomUsername();
        await directLoginToCrackedAccount(uname, false);
    }
</script>

<svelte:window on:click={handleWindowClick}/>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="account" class:expanded bind:this={accountElement} on:click={handleSelectClick}>
    <div class="header" bind:this={headerElement}>
        {#if $isLoggingIn}
            <div class="avatar-wrapper" transition:fade={{ duration: 200 }}>
                <RippleLoader size={44} />
            </div>
        {:else}
            <div class="avatar-wrapper">
                <object data={avatar} type="image/png" class="avatar" aria-label="avatar" in:fade={{ duration: 200, delay: 200 }}>
                    <img src="img/steve.png" alt=avatar class="avatar">
                </object>
            </div>
        {/if}
        
        <div class="info-block">
            <div class="username">{username}</div>
            <div class="account-type">
                {#if online}
                    <span class="online">{service}</span>
                {:else}
                    <span class="offline">{service}</span>
                {/if}
            </div>
        </div>

        <div class="buttons">
            <button class="icon-button" type="button" on:click={loginWithRandomUsername}>
                <ToolTip text="Random username"/>
                <img class="icon" src="img/menu/account/icon-random.svg" alt="random" style="filter: {iconFilter};">
            </button>
            <button class="icon-button" disabled={inAccountManager} type="button"
                    on:click={() => openScreen("altmanager")}>
                <ToolTip text="Change account"/>
                <img class="icon" src="img/menu/icon-pen.svg" alt="change" style="filter: {iconFilter};">
            </button>
        </div>
    </div>

    {#if expanded}
        <div class="quick-switcher" transition:fade|global={{ duration: 200, easing: quintOut }}>
            <!-- svelte-ignore a11y_autofocus -->
            <input type="text" autofocus class="account-search" placeholder="Search accounts..." bind:value={searchQuery}>

            {#if accounts.length > 0}
                {#if renderedAccounts.length > 0}
                    <div class="account-list">
                        {#each renderedAccounts as a}
                            <div on:click={() => login(a)} class="account-item"
                                 transition:slide|global={{ duration: 200, easing: quintOut }}
                                 class:active={a.username === username}>
                                <Avatar url={a.avatar}/>
                                <div class="account-info">
                                    <div class="username">{a.username}</div>
                                    <div class="type">{a.type}</div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="placeholder">No results</div>
                {/if}
            {:else}
                <div class="placeholder">Account list is empty</div>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
  .account {
    width: 340px;
    position: relative;
    z-index: 100;

    &.expanded .header {
      border-radius: 14px 14px 0 0;
    }
  }

  .header {
    background: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
    padding: 12px 14px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.4s;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

    .avatar-wrapper {
      position: relative;
      display: flex;

      .avatar {
        height: 44px;
        width: 44px;
        border-radius: 12px;
      }
    }

    .info-block {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .username {
      font-weight: 500;
      color: var(--clickgui-text-color);
      font-size: 16px;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .account-type {
      font-weight: 400;
      font-size: 14px;
      
      .online { color: var(--success-color); }
      .offline { color: var(--clickgui-text-dimmed-color); }
    }

    .buttons {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .icon-button {
      background-color: var(--clickgui-window-background-color);
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.4s;

      .icon { 
          width: 20px; 
          height: 20px; 
      }

      &:hover { 
          background-color: color-mix(in srgb, var(--accent-color) 80%, transparent);
      }
      
      &:disabled { 
          pointer-events: none; 
      }
    }
  }

  .quick-switcher {
    position: absolute;
    width: 100%;
    border-radius: 0 0 14px 14px;
    background: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
    border-top: none;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

    .placeholder {
      font-weight: 500;
      font-size: 14px;
      color: var(--clickgui-text-dimmed-color);
      padding: 14px 18px;
      text-align: center;
    }

    .account-search {
      background-color: var(--clickgui-window-background-color);
      border: none;
      color: var(--clickgui-text-color);
      padding: 14px 14px 14px 40px;
      width: 100%;
      font-size: 14px;
      outline: none;
      background-image: url("/img/menu/icon-search.svg");
      background-repeat: no-repeat;
      background-position: 16px center;
      background-size: 16px 16px;

      &::placeholder {
        color: var(--clickgui-text-dimmed-color);
      }
    }

    .account-list {
      max-height: 300px;
      overflow-y: auto;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;

      &::-webkit-scrollbar { width: 4px; }
      &::-webkit-scrollbar-thumb { background: var(--accent-color); border-radius: 8px; }
    }

    .account-item {
      padding: 8px 12px;
      border-radius: 12px;
      transition: all 0.4s;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;

      .account-info {
          display: flex;
          flex-direction: column;
      }

      .username {
        font-weight: 500;
        font-size: 14px;
        color: var(--clickgui-text-color);
      }

      .type {
        font-size: 12px;
        color: var(--clickgui-text-dimmed-color);
      }

      &:hover {
        background: var(--clickgui-window-background-color);
      }

      &.active {
        background: color-mix(in srgb, var(--accent-color) 20%, transparent);
        .username {
            color: var(--accent-color);
            font-weight: 500;
        }
      }
    }
  }
</style>