import { IStorageService } from '../../core'
import { CONFIG } from '../../core/constants'
import { IPosition } from '../../core/interfaces/IPosition'

export function clampPosition(left: number, top: number, root: HTMLElement): IPosition {
  const margin = CONFIG.UI_EDGE_MARGIN
  const maxLeft = Math.max(margin, window.innerWidth - root.offsetWidth - margin)
  const maxTop = Math.max(margin, window.innerHeight - root.offsetHeight - margin)
  return {
    left: Math.min(Math.max(left, margin), maxLeft),
    top: Math.min(Math.max(top, margin), maxTop)
  }
}

export function applyPosition(
  root: HTMLElement,
  left: number,
  top: number,
  save: boolean,
  storage?: IStorageService
): void {
  const clamped = clampPosition(left, top, root)
  root.style.left = `${clamped.left}px`
  root.style.top = `${clamped.top}px`
  root.style.right = 'auto'
  if (save && storage) storage.savePosition(clamped)
}

export function makeDraggable(
  root: HTMLElement,
  dragHandle: HTMLElement,
  storage: IStorageService,
  onDragStateChange: (isDragging: boolean) => void
): void {
  let pointerId: number | null = null
  let offsetX = 0
  let offsetY = 0

  dragHandle.addEventListener('pointerdown', (e: PointerEvent) => {
    pointerId = e.pointerId
    const rect = root.getBoundingClientRect()
    offsetX = e.clientX - rect.left
    offsetY = e.clientY - rect.top
    onDragStateChange(true)
    root.classList.add('lhvj-dragging')
    dragHandle.setPointerCapture(pointerId)
    e.preventDefault()
  })

  dragHandle.addEventListener('pointermove', (e: PointerEvent) => {
    if (pointerId !== e.pointerId) return
    applyPosition(root, e.clientX - offsetX, e.clientY - offsetY, false)
    e.preventDefault()
  })

  const stopDrag = (e: PointerEvent): void => {
    if (pointerId !== e.pointerId) return
    onDragStateChange(false)
    root.classList.remove('lhvj-dragging')
    if (dragHandle.hasPointerCapture(pointerId)) {
      dragHandle.releasePointerCapture(pointerId)
    }
    const rect = root.getBoundingClientRect()
    applyPosition(root, rect.left, rect.top, true, storage)
    pointerId = null
    e.preventDefault()
  }

  dragHandle.addEventListener('pointerup', stopDrag)
  dragHandle.addEventListener('pointercancel', stopDrag)
}
