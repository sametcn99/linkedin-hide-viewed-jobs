import type { TDetectionMode } from '../../core/types'
import type { IHighlightSettings } from '../../core/interfaces/IHighlightSettings'
import type { IUIState } from '../../core/interfaces/IUIState'
import { DOM_IDS } from '../../core/constants'
import type { IBadge } from './IBadge'
import { buildHeader, buildSettingsPanel, cacheElements, createBadgeRoot } from './dom'
import {
  attachKeywordInput,
  createDuplicateMessage,
  KeywordManager,
  renderKeywordChips,
  syncKeywordChips
} from './keywords'
import { applyPosition, makeDraggable } from './position'
import type { BadgeDependencies } from './types'

/**
 * The draggable UI badge that shows viewed/hidden job counts.
 */
export class Badge implements IBadge {
  private readonly state: IUIState = {
    root: null,
    countNum: null,
    countUnit: null,
    stateEl: null,
    guardBtn: null,
    cooldownEl: null,
    settingsBtn: null,
    settingsPanel: null,
    modeHideBtn: null,
    modeHighlightBtn: null,
    reloadNavBtn: null,
    viewedColorInput: null,
    appliedColorInput: null,
    activeColorInput: null,
    keywordColorInput: null,
    viewedColorResetBtn: null,
    appliedColorResetBtn: null,
    activeColorResetBtn: null,
    keywordColorResetBtn: null,
    opacityInput: null,
    opacityValue: null,
    opacityResetBtn: null,
    keywordChipContainer: null,
    keywordChipInput: null,
    keywordCountDisplay: null
  }
  private isDragging = false
  private readonly storage: BadgeDependencies['storage']
  private readonly keywordManager: KeywordManager
  private readonly duplicateMessage: {
    element: HTMLSpanElement
    show: () => void
    hide: () => void
  }
  private readonly chipInput: HTMLInputElement
  private chipContainer: HTMLDivElement | null = null
  private chipInputRow: HTMLDivElement | null = null

  constructor(deps: BadgeDependencies) {
    this.storage = deps.storage
    this.keywordManager = new KeywordManager(
      deps.initialCustomKeywords,
      deps.onCustomKeywordsChange
    )
    this.duplicateMessage = createDuplicateMessage()
    this.chipInput = this.createChipInput()

    this.handlers = {
      onToggle: deps.onToggle,
      onScrollGuardToggle: deps.onScrollGuardToggle,
      onDetectionModeChange: deps.onDetectionModeChange,
      onReloadNavigationToggle: deps.onReloadNavigationToggle,
      onHighlightColorChange: deps.onHighlightColorChange,
      onHighlightColorReset: deps.onHighlightColorReset,
      onHighlightOpacityChange: deps.onHighlightOpacityChange,
      onHighlightOpacityReset: deps.onHighlightOpacityReset
    }
  }

  /** Create or reattach the badge, returns the root element */
  ensure(
    isEnabled: boolean,
    scrollGuardEnabled: boolean,
    detectionMode: TDetectionMode,
    reloadOnNavigationEnabled: boolean,
    highlightSettings: IHighlightSettings
  ): void {
    this.ensureRoot(
      isEnabled,
      scrollGuardEnabled,
      detectionMode,
      reloadOnNavigationEnabled,
      highlightSettings
    )
  }

  /** Update displayed count and state label */
  updateCount(
    count: number,
    isEnabled: boolean,
    scrollGuardEnabled: boolean,
    detectionMode: TDetectionMode,
    reloadOnNavigationEnabled: boolean,
    highlightSettings: IHighlightSettings,
    cooldownSecondsLeft = 0,
    keywordCount = 0
  ): void {
    const root = this.state.root
    if (
      !root ||
      !this.state.countNum ||
      !this.state.countUnit ||
      !this.state.stateEl ||
      !this.state.guardBtn ||
      !this.state.cooldownEl ||
      !this.state.settingsBtn ||
      !this.state.modeHideBtn ||
      !this.state.modeHighlightBtn ||
      !this.state.reloadNavBtn ||
      !this.state.viewedColorInput ||
      !this.state.appliedColorInput ||
      !this.state.activeColorInput ||
      !this.state.keywordColorInput ||
      !this.state.opacityInput ||
      !this.state.opacityValue
    ) {
      return
    }

    root.setAttribute('data-enabled', isEnabled ? '1' : '0')
    root.setAttribute('data-scroll-guard', scrollGuardEnabled ? '1' : '0')
    root.setAttribute('data-cooldown', cooldownSecondsLeft > 0 ? '1' : '0')
    root.setAttribute('data-detection-mode', detectionMode)
    root.setAttribute('data-reload-on-navigation', reloadOnNavigationEnabled ? '1' : '0')

    if (!isEnabled && root.getAttribute('data-settings-open') === '1') {
      root.setAttribute('data-settings-open', '0')
      this.state.settingsBtn.textContent = 'Open settings'
    }

    this.state.countNum.textContent = String(count)
    this.state.countUnit.textContent = !isEnabled
      ? 'off'
      : detectionMode === 'hide'
        ? 'hidden'
        : 'marked'
    this.state.stateEl.textContent = isEnabled ? 'ON' : 'OFF'
    this.state.guardBtn.textContent = scrollGuardEnabled ? 'GUARD ON' : 'GUARD OFF'
    this.state.cooldownEl.textContent = cooldownSecondsLeft > 0 ? `CD ${cooldownSecondsLeft}s` : ''
    this.state.modeHideBtn.setAttribute('data-active', detectionMode === 'hide' ? '1' : '0')
    this.state.modeHighlightBtn.setAttribute(
      'data-active',
      detectionMode === 'highlight' ? '1' : '0'
    )
    this.state.viewedColorInput.value = highlightSettings.colors.viewed
    this.state.appliedColorInput.value = highlightSettings.colors.applied
    this.state.activeColorInput.value = highlightSettings.colors.active
    this.state.keywordColorInput.value = highlightSettings.colors.keyword
    this.state.opacityInput.value = String(highlightSettings.opacity)
    this.state.opacityValue.textContent = `${Math.round(highlightSettings.opacity * 100)}%`
    this.state.reloadNavBtn.textContent = reloadOnNavigationEnabled ? 'Reload ON' : 'Reload OFF'
    this.state.reloadNavBtn.setAttribute('data-active', reloadOnNavigationEnabled ? '1' : '0')
    this.state.settingsBtn.textContent =
      root.getAttribute('data-settings-open') === '1' ? 'Close settings' : 'Open settings'
    if (this.state.keywordCountDisplay) {
      this.state.keywordCountDisplay.textContent =
        keywordCount > 0 ? `+${keywordCount} keyword` : ''
    }
    this.syncKeywordChips()
  }

  /** Remove the badge from the DOM */
  remove(): void {
    const root = document.getElementById(DOM_IDS.UI_ID)
    if (root) root.remove()
    this.clearState()
  }

  /** Clamp badge position within the viewport */
  syncPositionWithinViewport(): void {
    const root = document.getElementById(DOM_IDS.UI_ID) as HTMLDivElement | null
    if (!root) return
    const rect = root.getBoundingClientRect()
    applyPosition(root, rect.left, rect.top, false)
  }

  // ── Private ──────────────────────────────────────────────────────────

  private readonly handlers: {
    onToggle: BadgeDependencies['onToggle']
    onScrollGuardToggle: BadgeDependencies['onScrollGuardToggle']
    onDetectionModeChange: BadgeDependencies['onDetectionModeChange']
    onReloadNavigationToggle: BadgeDependencies['onReloadNavigationToggle']
    onHighlightColorChange: BadgeDependencies['onHighlightColorChange']
    onHighlightColorReset: BadgeDependencies['onHighlightColorReset']
    onHighlightOpacityChange: BadgeDependencies['onHighlightOpacityChange']
    onHighlightOpacityReset: BadgeDependencies['onHighlightOpacityReset']
  }

  private createChipInput(): HTMLInputElement {
    const input = document.createElement('input')
    input.type = 'text'
    input.className = 'lhvj-keyword-input'
    input.placeholder = 'Type keyword and press Enter'
    input.setAttribute('aria-label', 'Add custom keyword')
    return input
  }

  private ensureRoot(
    isEnabled: boolean,
    scrollGuardEnabled: boolean,
    detectionMode: TDetectionMode,
    reloadOnNavigationEnabled: boolean,
    highlightSettings: IHighlightSettings
  ): HTMLDivElement {
    if (this.state.root && document.body.contains(this.state.root)) {
      return this.state.root
    }

    let root = document.getElementById(DOM_IDS.UI_ID) as HTMLDivElement | null
    if (root) {
      this.applyState(cacheElements(root))
      return root
    }

    root = this.buildDom(
      isEnabled,
      scrollGuardEnabled,
      detectionMode,
      reloadOnNavigationEnabled,
      highlightSettings
    )
    document.body.appendChild(root)

    const saved = this.storage.getSavedPosition()
    if (saved) {
      applyPosition(root, saved.left, saved.top, false)
    }

    this.applyState(cacheElements(root))
    return root
  }

  private buildDom(
    isEnabled: boolean,
    scrollGuardEnabled: boolean,
    detectionMode: TDetectionMode,
    reloadOnNavigationEnabled: boolean,
    highlightSettings: IHighlightSettings
  ): HTMLDivElement {
    const root = createBadgeRoot()
    root.setAttribute('data-enabled', isEnabled ? '1' : '0')
    root.setAttribute('data-scroll-guard', scrollGuardEnabled ? '1' : '0')
    root.setAttribute('data-detection-mode', detectionMode)
    root.setAttribute('data-reload-on-navigation', reloadOnNavigationEnabled ? '1' : '0')

    const initialCountUnit = !isEnabled ? 'off' : detectionMode === 'hide' ? 'hidden' : 'marked'

    const header = buildHeader(
      {
        isEnabled,
        scrollGuardEnabled,
        onToggle: this.handlers.onToggle,
        onScrollGuardToggle: this.handlers.onScrollGuardToggle
      },
      initialCountUnit
    )

    this.wireHeaderInteractions(root, header)

    const settings = buildSettingsPanel({
      detectionMode,
      reloadOnNavigationEnabled,
      highlightSettings,
      onDetectionModeChange: this.handlers.onDetectionModeChange,
      onReloadNavigationToggle: this.handlers.onReloadNavigationToggle,
      onHighlightColorChange: this.handlers.onHighlightColorChange,
      onHighlightColorReset: this.handlers.onHighlightColorReset,
      onHighlightOpacityChange: this.handlers.onHighlightOpacityChange,
      onHighlightOpacityReset: this.handlers.onHighlightOpacityReset
    })

    this.chipContainer = settings.chipContainer
    this.chipInputRow = settings.chipInputRow
    this.chipInputRow.appendChild(this.chipInput)
    this.chipInputRow.appendChild(this.duplicateMessage.element)

    attachKeywordInput(
      this.chipInput,
      this.keywordManager,
      this.duplicateMessage,
      (container, input) => this.refreshChips(container, input),
      () => this.chipContainer
    )

    renderKeywordChips(this.chipContainer, this.keywordManager.getKeywords(), (keyword) => {
      this.keywordManager.remove(keyword)
      this.refreshChips(this.chipContainer, this.chipInput)
    })

    root.appendChild(header.root)
    root.appendChild(settings.panel)

    makeDraggable(root, header.dragHandle, this.storage, (dragging) => {
      this.isDragging = dragging
    })

    return root
  }

  private wireHeaderInteractions(
    root: HTMLDivElement,
    header: ReturnType<typeof buildHeader>
  ): void {
    const { stateEl, guardBtn, settingsBtn } = header

    stateEl.addEventListener('click', (e) => {
      e.preventDefault()
      this.handlers.onToggle(root.getAttribute('data-enabled') !== '1')
    })
    stateEl.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      e.preventDefault()
      this.handlers.onToggle(root.getAttribute('data-enabled') !== '1')
    })

    guardBtn.addEventListener('click', (e) => {
      e.preventDefault()
      const enabled = root.getAttribute('data-scroll-guard') !== '1'
      this.handlers.onScrollGuardToggle(enabled)
    })

    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault()
      const open = root.getAttribute('data-settings-open') === '1'
      const nextOpen = !open
      root.setAttribute('data-settings-open', nextOpen ? '1' : '0')
      settingsBtn.textContent = nextOpen ? 'Close settings' : 'Open settings'
    })
  }

  private refreshChips(container: HTMLDivElement, input: HTMLInputElement): void {
    renderKeywordChips(container, this.keywordManager.getKeywords(), (keyword) => {
      this.keywordManager.remove(keyword)
      this.refreshChips(container, input)
    })
  }

  private syncKeywordChips(): void {
    const container = this.state.keywordChipContainer
    if (!container) return
    if (syncKeywordChips(container, this.keywordManager.getKeywords())) {
      this.refreshChips(container, this.chipInput)
    }
  }

  private applyState(state: IUIState): void {
    Object.assign(this.state, state)
  }

  private clearState(): void {
    ;(Object.keys(this.state) as Array<keyof IUIState>).forEach((key) => {
      this.state[key] = null
    })
  }
}
