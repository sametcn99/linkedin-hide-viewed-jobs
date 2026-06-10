const POPUP_BOUNDS_KEY = 'lhvj-popup-bounds'

const DEFAULT_WIDTH = 580
const DEFAULT_HEIGHT = 780

let popupWindowId: number | undefined

chrome.action.onClicked.addListener(() => {
  if (popupWindowId !== undefined) {
    chrome.windows.get(popupWindowId).then(
      (win) => {
        if (win.id !== undefined) {
          chrome.windows.update(win.id, { focused: true })
          return
        }
        openPopupWindow()
      },
      () => {
        popupWindowId = undefined
        openPopupWindow()
      }
    )
  } else {
    openPopupWindow()
  }
})

function openPopupWindow() {
  const popupUrl = chrome.runtime.getURL('popup.html')
  chrome.storage.local.get(POPUP_BOUNDS_KEY, (result) => {
    const bounds = result[POPUP_BOUNDS_KEY] as
      | { width: number; height: number; top: number; left: number }
      | undefined
    const width = bounds?.width ?? DEFAULT_WIDTH
    const height = bounds?.height ?? DEFAULT_HEIGHT
    const top = bounds?.top ?? 100
    const left = bounds?.left ?? 960

    chrome.windows
      .create({
        url: popupUrl,
        type: 'popup',
        width,
        height,
        top,
        left
      })
      .then((win) => {
        if (win.id !== undefined) {
          popupWindowId = win.id
        }
      })
  })
}

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === popupWindowId) {
    popupWindowId = undefined
  }
})

chrome.windows.onBoundsChanged.addListener((win) => {
  if (win.id !== popupWindowId) return
  const bounds = {
    width: win.width,
    height: win.height,
    top: win.top,
    left: win.left
  }
  chrome.storage.local.set({ [POPUP_BOUNDS_KEY]: bounds })
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'get-settings') {
    chrome.storage.local.get(null, (result) => {
      const settings: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(result)) {
        if (key.startsWith('lhvj-')) {
          settings[key] = value
        }
      }
      sendResponse(settings)
    })
    return true
  }
})
