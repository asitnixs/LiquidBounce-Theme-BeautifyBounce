import { setItem } from "../integration/persistent_storage";

export type ThemeName = "dark" | "light";

export const THEME_KEY = "liquidbounce_selected_theme";

export function applyClickGuiTheme(name: ThemeName) {
    const root = document.documentElement;
    root.classList.remove("clickgui-theme-light", "clickgui-theme-dark");
    root.classList.add(`clickgui-theme-${name}`);
}

export function resetClickGuiTheme() {
}

export async function saveAndApplyTheme(name: ThemeName) {
    applyClickGuiTheme(name);
    
    if (localStorage.getItem(THEME_KEY) !== name) {
        localStorage.setItem(THEME_KEY, name);
    }

    await setItem(THEME_KEY, name);
}

export function getSavedTheme(): ThemeName {
    return (localStorage.getItem(THEME_KEY) as ThemeName) ?? "dark";
}