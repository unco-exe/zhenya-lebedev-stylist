import { useCallback, useEffect, useRef, useState } from 'react'

const offsets = [
  { x: 0, y: 0, r: 0, s: 1 },
  { x: 8, y: 15, r: 1.4, s: .968 },
  { x: -7, y: 23, r: -1.7, s: .94 },
  { x: 10, y: 30, r: 1.9, s: .915 },
  { x: -8, y: 36, r: -2, s: .89 },
]

export default function CardDeckCarousel({ items, onView }) {
  const [active, setActive] = useState(0)
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false })
  const [moving, setMoving] = useState(null)
  const origin = useRef({ x: 0, y: 0 })
  const timer = useRef(null)
  const total = items.length

  useEffect(() => {
    items.forEach((item) => { const image = new Image(); image.src = item.image })
    return () => window.clearTimeout(timer.current)
  }, [items])

  const move = useCallback((step) => {
    if (moving || total < 2) return
    const next = (active + step + total) % total
    setMoving({ step, next })
    onView?.(items[next])
    timer.current = window.setTimeout(() => {
      setActive(next)
      setDrag({ x: 0, y: 0, active: false })
      setMoving(null)
    }, 560)
  }, [active, items, moving, onView, total])

  const pointerDown = (event) => {
    if (moving) return
    event.currentTarget.setPointerCapture(event.pointerId)
    origin.current = { x: event.clientX, y: event.clientY }
    setDrag({ x: 0, y: 0, active: true })
  }
  const pointerMove = (event) => {
    if (!drag.active) return
    setDrag({ x: event.clientX - origin.current.x, y: event.clientY - origin.current.y, active: true })
  }
  const pointerUp = () => {
    if (!drag.active) return
    if (drag.x < -60) move(1)
    else if (drag.x > 60) move(-1)
    else setDrag({ x: 0, y: 0, active: false })
  }

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  const stackIndexes = Array.from({ length: Math.min(5, total) }, (_, depth) => (active + depth) % total)
  if (moving?.step < 0 && !stackIndexes.includes(moving.next)) stackIndexes[stackIndexes.length - 1] = moving.next

  return <div className="deck-shell">
    <div className="card-deck" tabIndex="0" aria-label="Галерея работ. Перетаскивайте верхнюю карточку или используйте стрелки.">
      {[...stackIndexes].reverse().map((index, reverseDepth) => {
        const depth = stackIndexes.length - 1 - reverseDepth
        const item = items[index]
        const top = depth === 0
        const promoted = Boolean(moving && index === moving.next)
        const offset = offsets[depth]
        const dragX = Math.max(-22, Math.min(22, drag.x))
        const dragY = Math.max(-14, Math.min(14, drag.y))
        let transform = `translate3d(${offset.x}px,${offset.y}px,${-depth * 18}px) rotate(${offset.r}deg) scale(${offset.s})`
        let zIndex = 20 - depth
        if (top) {
          transform = moving
            ? `translate3d(0,18px,-52px) rotate(${moving.step * 1.4}deg) scale(.965)`
            : `translate3d(${dragX}px,${dragY}px,${drag.active ? 12 : 0}px) rotate(${dragX * .025}deg) scale(${drag.active ? .994 : 1})`
          zIndex = moving ? 18 : 24
        } else if (promoted) {
          transform = 'translate3d(0,0,18px) rotate(0deg) scale(1)'
          zIndex = 22
        }
        const style = {
          zIndex,
          transform,
          transition: drag.active && top ? 'none' : 'transform .56s cubic-bezier(.22,.68,.24,1), box-shadow .56s ease',
        }
        return <figure
          className={`deck-card ${top ? 'active' : ''}`}
          style={style}
          key={`${item.id}-${index}`}
          onPointerDown={top ? pointerDown : undefined}
          onPointerMove={top ? pointerMove : undefined}
          onPointerUp={top ? pointerUp : undefined}
          onPointerCancel={top ? pointerUp : undefined}
          data-cursor={top ? 'DRAG' : undefined}
        >
          <img src={item.image} alt={top ? item.alt : ''} loading={depth < 2 ? 'eager' : 'lazy'} draggable="false" style={{ objectPosition: item.position }} />
          <figcaption><span>{item.category} / {item.id}</span><span>{item.title}</span></figcaption>
        </figure>
      })}
    </div>
    <div className="deck-controls">
      <span>{String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
      <div><button type="button" aria-label="Предыдущая работа" onClick={() => move(-1)}>←</button><button type="button" aria-label="Следующая работа" onClick={() => move(1)}>→</button></div>
    </div>
  </div>
}
