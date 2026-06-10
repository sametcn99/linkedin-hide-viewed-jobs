export interface StatsResponse {
  hiddenCount: number
  isJobsPage: boolean
  cooldownSecondsLeft: number
}

export interface PopupElements {
  toggleShowHidden: HTMLButtonElement
  toggleScrollGuard: HTMLButtonElement
  toggleReloadNav: HTMLButtonElement
  modeHide: HTMLInputElement
  modeHighlight: HTMLInputElement
  highlightSettings: HTMLElement
  colorViewed: HTMLInputElement
  colorApplied: HTMLInputElement
  colorActive: HTMLInputElement
  colorKeyword: HTMLInputElement
  keywordChipContainer: HTMLElement
  keywordChipInput: HTMLInputElement
  opacitySlider: HTMLInputElement
  opacityValue: HTMLElement
  resetHighlightColorsBtn: HTMLButtonElement | null
  hiddenCountEl: HTMLElement
  notOnJobsPageEl: HTMLElement
  exportBtn: HTMLButtonElement | null
  importBtn: HTMLButtonElement | null
  importFileInput: HTMLInputElement | null
  ioStatus: HTMLElement | null
  updateBanner: HTMLAnchorElement | null
  updateVersion: HTMLElement | null
  checkUpdateBtn: HTMLButtonElement | null
  updateSummary: HTMLElement | null
  updateStatus: HTMLElement | null
}
