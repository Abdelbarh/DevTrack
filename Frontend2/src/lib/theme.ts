export type Theme = 'dark' | 'light'

export function getTheme(): Theme {
  return (localStorage.getItem('theme') as Theme) ?? 'dark'
}

export function applyTheme(theme: Theme) {
  localStorage.setItem('theme', theme)
  document.documentElement.setAttribute('data-theme', theme)
}

export function initTheme() {
  applyTheme(getTheme())
}
