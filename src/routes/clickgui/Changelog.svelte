<script lang="ts">
    import { onMount } from "svelte";
    import { fade, slide } from "svelte/transition";
    import { browse } from "../../integration/rest";
    import { quintOut } from "svelte/easing";

    interface Release {
        id: number;
        name: string;
        tag_name: string;
        body: string;
        html_url: string;
        dateString: string;
    }

    let releases = $state<Release[]>([]);
    let selectedRelease = $state<Release | null>(null);
    
    let loading = $state(true);
    let error = $state("");
    let htmlContent = $state("");
    let dropdownOpen = $state(false);

    function handleWindowClick() {
        if (dropdownOpen) dropdownOpen = false;
    }

    function parseAndSortMarkdown(text: string) {
        if (!text) return `<div class="empty-state">Changelog is empty.</div>`;

        text = text.replace(/\r/g, '');
        text = text.replace(/\*?\*?Full Changelog\*?\*?:?[\s\S]*/gi, '');
        text = text.replace(/\n(?!\s*(?:[\*\-#]|\d+\.))/g, ' ');

        const listMatches = text.match(/^(?:\* |- )\s*(.+)$/gim);
        
        if (!listMatches || listMatches.length === 0) {
            return `<div class="empty-state">No changes listed for this release.</div>`;
        }

        const parsedItems = listMatches.map(line => {
            let content = line.replace(/^(?:\* |- )\s*/, '').trim();
            if (!content) return null;

            content = content.replace(/\s+by\s+@[\w-]+\s+in\s+(?:https?:\/\/\S+|#\d+)/gim, '');
            content = content.replace(/\s+in\s+https?:\/\/\S+/gim, '');

            let weight = 5;
            let badgeClass = 'badge-default';
            let iconName = 'icon-default.svg';
            let scope = '';

            const tagMatch = content.match(/^([a-zA-Z0-9_\/]+)(?:\(([^)]+)\))?:\s*(.+)$/);
            
            if (tagMatch) {
                const type = tagMatch[1].toLowerCase();
                scope = tagMatch[2] || '';
                content = tagMatch[3];

                if (type.includes('feat') || type.includes('add') || type.includes('feature')) {
                    weight = 1; badgeClass = 'badge-add'; iconName = 'icon-add.svg';
                } else if (type.includes('fix') || type.includes('patch')) {
                    weight = 2; badgeClass = 'badge-fix'; iconName = 'icon-fix.svg';
                } else if (type.includes('refactor') || type.includes('chore') || type.includes('chang') || type.includes('updat') || type.includes('improv') || type.includes('style') || type.includes('deps')) {
                    weight = 3; badgeClass = 'badge-edit'; iconName = 'icon-edit.svg';
                } else if (type.includes('remov') || type.includes('del') || type.includes('drop') || type === 'rm') {
                    weight = 4; badgeClass = 'badge-remove'; iconName = 'icon-remove.svg';
                } else {
                    content = `${tagMatch[1]}${scope ? `(${scope})` : ''}: ${content}`;
                }
            } 
            else if (content.includes('made their first contribution')) {
                weight = 6; badgeClass = 'badge-default'; iconName = 'icon-user.svg';
                badgeClass += '" style="color: var(--accent-color); background: color-mix(in srgb, var(--accent-color) 15%, transparent); border-color: color-mix(in srgb, var(--accent-color) 30%, transparent);';
            }

            content = content
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                .replace(/\[([^\[]+)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
                .replace(/@([a-zA-Z0-9_-]+)/g, '<span class="mention">@$1</span>')
                .replace(/#([0-9]+)/g, '<span class="pr-link">#$1</span>');

            const scopeHtml = scope ? `<span class="scope">${scope}</span>` : '';
            const opacityStyle = badgeClass === 'badge-default' ? 'opacity: 0.5;' : '';
            
            const html = `<div class="changelog-item"><div class="badge ${badgeClass}"><span class="badge-icon" style="mask-image: url('img/changelog/${iconName}'); -webkit-mask-image: url('img/changelog/${iconName}'); ${opacityStyle}"></span></div><div class="content-text">${scopeHtml} <span class="desc">${content}</span></div></div>`;

            return { weight, html };
        }).filter(Boolean);

        parsedItems.sort((a, b) => a!.weight - b!.weight);

        return parsedItems.map(item => item!.html).join('');
    }

    function selectRelease(release: Release) {
        selectedRelease = release;
        dropdownOpen = false;
        htmlContent = parseAndSortMarkdown(release.body);
    }

    onMount(async () => {
        const CACHE_KEY = "lb_github_releases_cache";
        
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsedCache = JSON.parse(cached);
                if (Date.now() - parsedCache.timestamp < 1000 * 60 * 60) {
                    releases = parsedCache.releases;
                    if (releases.length > 0) selectRelease(releases[0]);
                    loading = false;
                    return;
                }
            }

            const res = await fetch("https://api.github.com/repos/CCBlueX/LiquidBounce/releases");
            if (!res.ok) throw new Error(res.status === 403 ? "GitHub Rate Limit exceeded. Please try again later." : "Failed to load releases");

            const rawData = await res.json();
            
            releases = rawData.map((r: any) => {
                const dateObj = new Date(r.published_at || r.created_at);
                return {
                    id: r.id,
                    name: r.name || r.tag_name,
                    tag_name: r.tag_name,
                    body: r.body || "",
                    html_url: r.html_url,
                    dateString: dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                };
            });

            if (releases.length > 0) {
                selectRelease(releases[0]);
            } else {
                error = "No releases found on GitHub.";
            }

            localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), releases }));

        } catch (e: any) {
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    releases = JSON.parse(cached).releases;
                    if (releases.length > 0) selectRelease(releases[0]);
                }
            } catch (parseError) {
                error = e.message || "Failed to fetch from GitHub API";
            }
        } finally {
            loading = false;
        }
    });
</script>

<svelte:window onclick={handleWindowClick} />

<div class="changelog-container" transition:fade={{ duration: 200 }}>
    {#if loading}
        <div class="center-state">
            <div class="spinner"></div>
            <span>Fetching releases...</span>
        </div>
    {:else if error}
        <div class="center-state error">
            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>{error}</span>
        </div>
    {:else if selectedRelease}
        <div class="header-card">
            <div class="version-selector" onclick={(e) => { e.stopPropagation(); dropdownOpen = !dropdownOpen; }}>
                <div class="selector-content">
                    <h1 class="version-name">{selectedRelease.name}</h1>
                    <svg class="dropdown-arrow" class:rotated={dropdownOpen} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                <span class="date">Published on {selectedRelease.dateString}</span>
                
                {#if dropdownOpen}
                    <div class="dropdown-menu" transition:slide={{ duration: 200, easing: quintOut }}>
                        {#each releases as release}
                            <button 
                                class="dropdown-item" 
                                class:active={release.id === selectedRelease.id}
                                onclick={() => selectRelease(release)}
                            >
                                <span class="b-name">{release.name}</span>
                                <span class="b-date">{release.dateString}</span>
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
        <div class="markdown-body">
            {@html htmlContent}
        </div>
    {/if}
</div>

<style lang="scss">
    .changelog-container {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 20px;

        &::-webkit-scrollbar {
            width: 4px;
        }

        &::-webkit-scrollbar-thumb {
            background: var(--accent-color);
            border-radius: 8px;
        }
    }

    .center-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: 10px;
        color: var(--clickgui-text-dimmed-color);
        font-weight: 500;

        &.error {
            color: #fc4130;
            text-align: center;
            padding: 0 20px;
        }
    }

    .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(128,128,128,0.2);
        border-top-color: var(--accent-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .header-card {
        background: linear-gradient(135deg, color-mix(in srgb, var(--clickgui-base-color) 80%, transparent), color-mix(in srgb, var(--clickgui-base-color) 20%, transparent));
        border-radius: 14px;
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
    }

    .version-selector {
        display: flex;
        flex-direction: column;
        gap: 4px;
        cursor: pointer;
        padding: 6px 10px;
        border-radius: 14px;
        margin-left: -12px;
        border: 1px solid var(--clickgui-border-color);
        background: var(--clickgui-window-background-color);
        transition: all 0.4s;
        position: relative;

        &:hover {
             border-color: color-mix(in srgb, var(--accent-color) 40%, transparent);
        }
        
        .selector-content {
            display: flex;
            align-items: center;
            gap: 40px;
        }

        .version-name {
            margin: 0;
            font-size: 24px;
            color: var(--clickgui-text-color);
            font-weight: 500;
        }

        .date {
            font-size: 12px;
            color: var(--clickgui-text-dimmed-color);
        }
        
        .dropdown-arrow {
            width: 20px;
            height: 20px;
            color: white;
            transition: transform 0.4s;
            background-color: rgba(50, 50, 50, 0.4);
            border-radius: 8px;
            transition: all 0.4s ease;

            &.rotated {
                transform: rotate(-180deg);
                background: var(--accent-color);
            }
        }
    }

    .dropdown-menu {
        position: absolute;
        top: calc(100% + 4px);
        right: 0;
        min-width: 100%;
        width: max-content;
        background: var(--clickgui-window-background-color);
        border: 1px solid var(--clickgui-border-color);
        border-radius: 8px;
        padding: 4px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-height: 300px;
        overflow-y: auto;
        
        &::-webkit-scrollbar {
            display: none;
        }
    }

    .dropdown-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: transparent;
        border: none;
        padding: 10px 10px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.4s;
        color: var(--clickgui-text-dimmed-color);
        font-weight: 400;
        font-size: 14px;
        
        .b-date {
            color: var(--clickgui-text-dimmed-color);
            font-size: 12px;
        }
        
        &:hover {
            background: var(--clickgui-base-color);
            color: var(--clickgui-text-color);
        }

        &.active {
            background: color-mix(in srgb, var(--accent-color) 20%, transparent);
            color: var(--clickgui-text-color);
            font-weight: 500;
        }
    }

    .markdown-body {
        padding: 0 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    :global(.markdown-body h1), :global(.markdown-body h2), :global(.markdown-body h3) {
        color: var(--clickgui-text-color);
    }

    :global(.markdown-body a) { 
        color: var(--accent-color);
        text-decoration: none; 
    }
    :global(.markdown-body a:hover) { 
        text-decoration: underline;
    }

    :global(.mention) {
        color: var(--clickgui-text-color);
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
        font-size: 14px;
    }

    :global(.changelog-item) {
        display: flex; 
        align-items: center;
        gap: 10px;
        background: var(--clickgui-base-color);
        border: 1px solid var(--clickgui-border-color);
        padding: 10px 10px; 
        border-radius: 14px; 
        transition: background 0.4s, border-color 0.4s;
    }

    :global(.content-text) {
        color: var(--clickgui-text-color); 
        font-weight: 400; 
        font-size: 14px;
    }

    :global(.scope) {
        flex: 1; 
        display: flex; 
        flex-direction: column; 
        color: var(--accent-color); 
        font-size: 12px; 
        font-weight: 500;
        text-transform: uppercase; 
        letter-spacing: 0.4px;
        opacity: 0.8;
    }

    :global(.badge) {
        width: 30px; 
        height: 30px; 
        border-radius: 8px; 
        flex-shrink: 0;
        display: flex; 
        align-items: center; 
        justify-content: center;
    }

    :global(.badge-icon) {
        width: 16px; 
        height: 16px; 
        display: inline-block;
        background-color: currentColor;
        mask-size: contain;
        mask-repeat: no-repeat;
        mask-position: center;
        -webkit-mask-size: contain;
        -webkit-mask-repeat: no-repeat;
        -webkit-mask-position: center;
    }

    :global(.badge-add) { 
        background: rgba(103, 210, 74, 0.15);
        color: #67d24a;
        border: 1px solid rgba(103, 210, 74, 0.3); 
    }

    :global(.badge-remove) { 
        background: rgba(252, 65, 48, 0.15);
        color: #fc4130;
        border: 1px solid rgba(252, 65, 48, 0.3); 
    }

    :global(.badge-fix) { 
        background: rgba(239, 191, 4, 0.15);
        color: #efbf04;
        border: 1px solid rgba(239, 191, 4, 0.3); 
    }

    :global(.badge-edit) { 
        background: rgba(70, 119, 255, 0.15);
        color: #4677ff;
        border: 1px solid rgba(70, 119, 255, 0.3); 
    }

    :global(.badge-default) {
        background: transparent;
        border: 1px solid rgba(128,128,128, 0.2);
        color: var(--accent-color);
    }

    :global(.dot) { 
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--clickgui-text-dimmed-color); 
    }
</style>