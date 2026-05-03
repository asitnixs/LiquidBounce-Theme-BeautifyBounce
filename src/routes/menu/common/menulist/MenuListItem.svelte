<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import RippleLoader from "../RippleLoader.svelte";

    export let image: string;
    export let imageText: string | null = null;
    export let imageTextBackgroundColor: string | null = null;
    export let title: string;
    export let favorite = false;

    const dispatch = createEventDispatcher();
    let previewImageLoaded = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="menu-list-item" on:dblclick={() => dispatch("dblclick")}>
    <div class="image">
        {#if !previewImageLoaded}
            <div class="loader">
                <RippleLoader size={44} />
            </div>
        {/if}
        <img class="preview" on:load={() => previewImageLoaded = true} src={image} alt="preview">
        <span class="text" class:visible={imageText !== null && imageTextBackgroundColor !== null}
              style="background-color: {imageTextBackgroundColor};">{imageText}</span>
        {#if favorite}
            <img class="favorite-mark" src="img/menu/icon-favorite-mark.svg" alt="fav">
        {/if}
    </div>
    
    <div class="content-wrap">
        <div class="title">
            <span class="text">{title}</span>
            <slot name="tag"/>
        </div>
        <div class="subtitle">
            <slot name="subtitle"/>
        </div>
    </div>

    <div class="buttons">
        <div class="active">
            <slot name="active-visible"/>
        </div>

        <slot name="always-visible"/>
    </div>
</div>

<style lang="scss">
  .menu-list-item {
    display: flex;
    align-items: center;
    background: var(--clickgui-base-color);
    padding: 12px 18px;
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    cursor: grab;

    &:hover {
      background: var(--clickgui-window-background-color);

      .buttons .active {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }

  .image {
    position: relative;
    margin-right: 10px;

    .loader {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .preview {
      height: 56px;
      width: 56px;
      border-radius: 12px;
    }

    .favorite-mark {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 20px;
      height: 20px;
    }

    .text {
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      color: var(--clickgui-text-color);
      font-size: 12px;
      font-weight: 500;
      padding: 2px 4px;
      border-radius: 6px;
      white-space: nowrap;

      &.visible { display: block; }
    }
  }

  .content-wrap {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 4px;
    min-width: 0;
  }

  .title {
    display: flex;
    align-items: center;

    .text {
      font-size: 18px;
      color: var(--clickgui-text-color);
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .subtitle {
    font-size: 14px;
    color: var(--clickgui-text-dimmed-color);
    transition: ease color 0.4s;
  }

  .buttons {
    display: flex;
    align-items: center;

    .active {
      display: flex;
      opacity: 0;
      transform: translateX(10px);
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
  }
</style>