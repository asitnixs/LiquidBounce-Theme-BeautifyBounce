<div class="button-container">
    <slot />
</div>

<style lang="scss">
    .button-container {
      background: color-mix(in srgb, var(--clickgui-base-color) 90%, transparent);
      padding: 10px 12px;
      width: max-content;
      border-radius: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
</style>