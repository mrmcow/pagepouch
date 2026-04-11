(() => {
  if ((window as any).__pagestashAreaSelector) return
  ;(window as any).__pagestashAreaSelector = true

  const overlay = document.createElement('div')
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
    zIndex: '2147483647', cursor: 'crosshair', background: 'rgba(0,0,0,0.15)',
  })

  const selection = document.createElement('div')
  Object.assign(selection.style, {
    position: 'fixed', border: '2px solid #2563eb', background: 'rgba(37,99,235,0.08)',
    borderRadius: '4px', pointerEvents: 'none', display: 'none',
  })
  overlay.appendChild(selection)

  const hint = document.createElement('div')
  Object.assign(hint.style, {
    position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
    background: '#0f172a', color: '#fff', padding: '8px 16px', borderRadius: '8px',
    fontSize: '13px', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)', zIndex: '1', pointerEvents: 'none',
  })
  hint.textContent = 'Drag to select an area · Press Esc to cancel'
  overlay.appendChild(hint)

  let startX = 0, startY = 0, isDragging = false

  overlay.addEventListener('mousedown', (e) => {
    startX = e.clientX; startY = e.clientY; isDragging = true
    selection.style.display = 'block'
    selection.style.left = startX + 'px'
    selection.style.top = startY + 'px'
    selection.style.width = '0px'
    selection.style.height = '0px'
  })

  overlay.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    const x = Math.min(startX, e.clientX)
    const y = Math.min(startY, e.clientY)
    const w = Math.abs(e.clientX - startX)
    const h = Math.abs(e.clientY - startY)
    Object.assign(selection.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' })
  })

  overlay.addEventListener('mouseup', (e) => {
    if (!isDragging) return
    isDragging = false
    const rect = {
      x: Math.min(startX, e.clientX),
      y: Math.min(startY, e.clientY),
      width: Math.abs(e.clientX - startX),
      height: Math.abs(e.clientY - startY),
      devicePixelRatio: window.devicePixelRatio || 1,
    }

    cleanup()

    if (rect.width < 10 || rect.height < 10) return

    // Wait for the browser to repaint without the overlay before
    // telling the background script to capture the visible tab.
    requestAnimationFrame(() => {
      setTimeout(() => {
        const api = typeof browser !== 'undefined' ? browser : chrome
        api.runtime.sendMessage({ type: 'AREA_SELECTED', payload: rect })
      }, 120)
    })
  })

  const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cleanup() }
  document.addEventListener('keydown', handleKey, true)

  function cleanup() {
    overlay.remove()
    document.removeEventListener('keydown', handleKey, true)
    ;(window as any).__pagestashAreaSelector = false
  }

  document.body.appendChild(overlay)
})()
