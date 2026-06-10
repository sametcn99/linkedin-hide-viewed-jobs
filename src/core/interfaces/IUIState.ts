/** Cached references to badge DOM elements */
export interface IUIState {
  root: HTMLDivElement | null
  countNum: HTMLSpanElement | null
  countUnit: HTMLSpanElement | null
  stateEl: HTMLSpanElement | null
  guardBtn: HTMLButtonElement | null
  cooldownEl: HTMLSpanElement | null
  settingsBtn: HTMLButtonElement | null
  settingsPanel: HTMLDivElement | null
  modeHideBtn: HTMLButtonElement | null
  modeHighlightBtn: HTMLButtonElement | null
  reloadNavBtn: HTMLButtonElement | null
  viewedColorInput: HTMLInputElement | null
  appliedColorInput: HTMLInputElement | null
  activeColorInput: HTMLInputElement | null
  keywordColorInput: HTMLInputElement | null
  viewedColorResetBtn: HTMLButtonElement | null
  appliedColorResetBtn: HTMLButtonElement | null
  activeColorResetBtn: HTMLButtonElement | null
  keywordColorResetBtn: HTMLButtonElement | null
  opacityInput: HTMLInputElement | null
  opacityValue: HTMLSpanElement | null
  opacityResetBtn: HTMLButtonElement | null
  keywordChipContainer: HTMLDivElement | null
  keywordChipInput: HTMLInputElement | null
  keywordCountDisplay: HTMLSpanElement | null
}
