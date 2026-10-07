import { useCallback, useEffect, useRef, useState } from 'react'

const offsets = [
  { x: 0, y: 0, r: 0, s: 1 },
  { x: 8, y: 15, r: 1.4, s: 0.968 },
  { x: -7, y: 23, r: -1.7, s: 0.94 },
  { x: 10, y: 30, r: 1.9, s: 0.915 },
  { x: -8, y: 36, r: -2, s: 0.89 },
]

const wrap = (value, total) => ((value % total) + total) % total

export default function CardDeckCarousel({ items, onView }) {
  const [active, setActive] = useState(0)
  const [override, setOverride] = useState(null)
  const deckRef = useRef(null)
  const activeRef = useRef(0)
  const busyRef = useRef(false)
  const timerRef = useRef(null)
  const dragRef = useRef(null)
  const total = items.length

  activeRef.current = active

  useEffect(() => {
    items.forEach((item) => {
      const image = new Image()
      image.src = item.image
    })
    return () => window.clearTimeout(timerRef.current)
  }, [items])

  const show = useCallback((index) => {
    setActive(index)
    activeRef.current = index
    onView?.(items[index])
  }, [items, onView])

  const throwTop = useCallback((direction, fromX = 0, fromY = 0, vertical = 0) => {
    if (busyRef.current || total < 2) return
    busyRef.current = true
    const index = activeRef.current
    const width = deckRef.current?.offsetWidth || 360
    const sign = direction >= 0 ? 1 : -1
    setOverride({ index, x: fromX + sign * width * 1.35, y: fromY + vertical * 0.35 - 34, r: sign * 13, mode: 'fly' })
    show(wrap(index + 1, total))
    timerRef.current = window.setTimeout(() => {
      setOverride(null)
      busyRef.current = false
    }, 500)
  }, [show, total])

  const pullPrevious = useCallback(() => {
    if (busyRef.current || total < 2) return
    busyRef.current = true
    const previous = wrap(activeRef.current - 1, total)
    const width = deckRef.current?.offsetWidth || 360
    show(previous)
    setOverride({ index: previous, x: -width * 1.35, y: -30, r: -13, mode: 'snap' })
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOverride({ index: previous, x: 0, y: 0, r: 0, mode: 'fly' })
        timerRef.current = window.setTimeout(() => {
          setOverride(null)
          busyRef.current = false
        }, 500)
      })
    })
  }, [show, total])

  const pointerDown = (event) => {
    if (busyRef.current || (event.pointerType === 'mouse' && event.button !== 0)) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { x: event.clientX, y: event.clientY, lastX: event.clientX, lastTime: event.timeStamp, velocityX: 0 }
  }

  const pointerMove = (event) => {
    const drag = dragRef.current
    if (!drag) return
    const elapsed = Math.max(1, event.timeStamp - drag.lastTime)
    drag.velocityX = 0.8 * ((event.clientX - drag.lastX) / elapsed) + 0.2 * drag.velocityX
    drag.lastX = event.clientX
    drag.lastTime = event.timeStamp
    const x = event.clientX - drag.x
    const y = event.clientY - drag.y
    setOverride({ index: activeRef.current, x, y, r: x * 0.045, mode: 'drag' })
  }

  const pointerUp = (event) => {
    const drag = dragRef.current
    dragRef.current = null
    if (!drag) return
    const x = event.clientX - drag.x
    const y = event.clientY - drag.y
    const width = deckRef.current?.offsetWidth || 360
    const shouldThrow = Math.abs(x) > width * 0.23 || (Math.abs(drag.velocityX) > 0.5 && Math.abs(x) > 22)
    if (shouldThrow) throwTop(x || drag.velocityX, x, y, y)
    else setOverride(null)
  }

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        throwTop(1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        pullPrevious()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pullPrevious, throwTop])

  return (
    <div className="deck-shell">
      <div ref={deckRef} className="card-deck" tabIndex="0" aria-label="Галерея работ. Перетаскивайте верхнюю карточку или используйте стрелки.">
        {items.map((item, index) => {
          const depth = wrap(index - active, total)
          const visibleDepth = Math.min(depth, offsets.length - 1)
          const pose = offsets[visibleDepth]
          const top = depth === 0
          const custom = override?.index === index ? override : null
          const transform = custom ? `translate3d(${custom.x}px,${custom.y}px,80px) rotate(${custom.r}deg) scale(1)` : `translate3d(${pose.x}px,${pose.y}px,${-visibleDepth * 18}px) rotate(${pose.r}deg) scale(${pose.s})`
          const visible = depth < offsets.length || Boolean(custom)
          return (
            <figure
              className={`deck-card ${top ? 'active' : ''} ${custom ? `is-${custom.mode}` : ''}`}
              style={{ zIndex: custom ? 40 : 24 - depth, transform, opacity: visible ? 1 : 0, visibility: visible ? 'visible' : 'hidden' }}
              key={item.id}
              onPointerDown={top ? pointerDown : undefined}
              onPointerMove={top ? pointerMove : undefined}
              onPointerUp={top ? pointerUp : undefined}
              onPointerCancel={top ? pointerUp : undefined}
              data-cursor={top ? 'DRAG' : undefined}
              aria-hidden={!top}
            >
              <img src={item.image} alt={top ? item.alt : ''} loading={depth < 2 ? 'eager' : 'lazy'} draggable="false" style={{ objectPosition: item.position }} />
              <figcaption><span>{item.category} / {item.id}</span><span>{item.title}</span></figcaption>
            </figure>
          )
        })}
      </div>
      <div className="deck-controls">
        <span>{String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        <div>
          <button type="button" aria-label="Предыдущая работа" onClick={pullPrevious}>←</button>
          <button type="button" aria-label="Следующая работа" onClick={() => throwTop(1)}>→</button>
        </div>
      </div>
    </div>
  )
}
