import { useCallback, useEffect, useRef, useState } from 'react'
import CardDeckCarousel from './components/CardDeckCarousel'
import HeroObject from './components/HeroObject'
import { education, faq, services, site, socialProof, works } from './data'

const track = (event, detail = {}) => {
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...detail })
  window.dispatchEvent(new CustomEvent('zhenya:analytics', { detail: { event, ...detail } }))
}

function Image({ src, alt, eager = false, ...props }) {
  return <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" {...props} />
}

function Loader() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    try {
      if (!sessionStorage.getItem('zl-loader')) {
        setVisible(true)
        sessionStorage.setItem('zl-loader', '1')
        const timer = setTimeout(() => setVisible(false), 950)
        return () => clearTimeout(timer)
      }
    } catch {
      /* storage may be unavailable */
    }
  }, [])
  return visible ? (
    <div className="loader" aria-hidden="true">
      <span>ZHENYA</span>
      <span>LEBEDEV</span>
    </div>
  ) : null
}

function Header({ openPanel }) {
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 36)
    const onKey = (event) => event.key === 'Escape' && setMenu(false)
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('keydown', onKey)
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('keydown', onKey)
    }
  }, [])
  const close = () => setMenu(false)
  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <a href="#top" className="logo" onClick={close}>
        ZHENYA LEBEDEV
      </a>
      <nav className={menu ? 'open' : ''} aria-label="Навигация">
        <a href="#work" onClick={close}>
          WORK
        </a>
        <a href="#about" onClick={close}>
          ABOUT
        </a>
        <a href="#services" onClick={close}>
          PRICE
        </a>
        <a href="#education" onClick={close}>
          EDUCATION
        </a>
        <button
          type="button"
          onClick={() => {
            close()
            openPanel('booking', 'header')
          }}
        >
          BOOK ↗
        </button>
      </nav>
      <button className="menu" type="button" aria-expanded={menu} onClick={() => setMenu(!menu)}>
        {menu ? 'CLOSE' : 'MENU'}
      </button>
    </header>
  )
}

function Hero({ openPanel }) {
  return (
    <section className="hero-v3" id="top">
      <div className="hero-grid" aria-hidden="true" />
      <HeroObject />
      <div className="hero-kicker">
        <span>ЖЕНЯ ЛЕБЕДЕВ</span>
        <span>ПАРИКМАХЕР-СТИЛИСТ · МОСКВА</span>
      </div>
      <h1>
        <span>НЕ ПОД</span>
        <span>РЕФЕРЕНС.</span>
        <span>
          <em>ПОД</em> ВАС.
        </span>
      </h1>
      <div className="hero-actions">
        <button
          className="text-link"
          data-cursor="OPEN"
          onClick={() => {
            track('hero_book_click')
            openPanel('booking', 'hero')
          }}
        >
          ЗАПИСАТЬСЯ <span>→</span>
        </button>
        <button
          className="text-link quiet"
          data-cursor="JOIN"
          onClick={() => {
            document.querySelector('#education')?.scrollIntoView({ behavior: 'smooth' })
            track('education_view', { source: 'hero' })
          }}
        >
          ОБУЧЕНИЕ <span>→</span>
        </button>
      </div>
    </section>
  )
}

function Works() {
  return (
    <section className="works-v3" id="work">
      <div className="works-copy reveal">
        <p className="section-label">SELECTED WORKS / 02</p>
        <h2>РАБОТЫ</h2>
        <p>Форма, цвет и текстура — без повторения картинки один в один.</p>
        <span>CUT · COLOR · TEXTURE</span>
        <small>Концептуальные placeholders. Заменить на реальные работы Жени.</small>
      </div>
      <CardDeckCarousel items={works} onView={(item) => track('portfolio_view', { work_id: item.id })} />
    </section>
  )
}

function About() {
  return (
    <section className="about-v3" id="about">
      <div className="about-photo">
        <Image src="/assets/zhenya-about-real-v5.jpg" alt="Женя Лебедев в чёрном худи, с очками и сумкой, у светло-серой стены" eager />
      </div>
      <div className="about-copy reveal">
        <p className="section-label">ZHENYA / APPROACH</p>
        <h2>
          СНАЧАЛА —<br />
          <em>ЧЕЛОВЕК.</em>
        </h2>
        <p>Я смотрю на лицо, волосы, привычки и на то, как человек будет жить с этой формой каждый день.</p>
        <p>
          Референс — это отправная точка.
          <br />
          Не инструкция.
        </p>
        <div className="about-meta">
          <span>FORM</span>
          <span>FACE</span>
          <span>DAILY LIFE</span>
        </div>
      </div>
    </section>
  )
}

function Services({ openPanel }) {
  return (
    <section className="services-v3" id="services">
      <div className="services-title reveal">
        <p className="section-label">SERVICES / 03</p>
        <h2>
          ЧТО МОЖНО
          <br />
          <em>СДЕЛАТЬ.</em>
        </h2>
      </div>
      <div className="service-list">
        {services.map((item) => (
          <button
            className="service-row"
            type="button"
            key={item.number}
            data-cursor="OPEN"
            onClick={() => {
              track('service_view', { service: item.name })
              openPanel('booking', item.name)
            }}
          >
            <span>{item.number}</span>
            <strong>{item.name}</strong>
            <p>{item.text}</p>
            <div>
              <b>{item.price}</b>
              <small>{item.time}</small>
            </div>
            <i>↗</i>
          </button>
        ))}
      </div>
      <div className="price-foot">
        <p>Финальная стоимость зависит от длины, густоты и исходной базы. Подтверждаем её заранее по фото.</p>
        <button className="text-link" onClick={() => openPanel('booking', 'services')}>
          ЗАПИСАТЬСЯ <span>→</span>
        </button>
      </div>
    </section>
  )
}

function Education({ openPanel }) {
  const ticker = 'FIRST STREAM / WAITLIST OPEN / '.repeat(10)
  return (
    <section className="education-v3" id="education">
      <div className="education-ticker" aria-hidden="true">
        <div className="education-ticker-track">
          <span>{ticker}</span>
          <span>{ticker}</span>
        </div>
      </div>
      <div className="education-poster">
        <Image src={education.poster} alt="Концептуальный постер первого потока обучения стрижкам: красная типографика интегрирована в светлые волосы" eager />
        <span>CAMPAIGN PLACEHOLDER / 2026</span>
      </div>
      <div className="education-copy reveal">
        <p className="education-status">● {education.status}</p>
        <p className="section-label">EDUCATION / FIRST STREAM</p>
        <h2>
          {education.title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h2>
        <p className="education-lead">{education.copy}</p>
        <div className="education-topics">
          {education.topics.map((topic) => (
            <span key={topic}>{topic}</span>
          ))}
        </div>
        <button
          className="education-cta"
          type="button"
          data-cursor="JOIN"
          onClick={() => {
            track('education_waitlist_click')
            openPanel('education', 'education')
          }}
        >
          В ЛИСТ ОЖИДАНИЯ <span>→</span>
        </button>
        <small>Узнайте о старте первого потока раньше остальных.</small>
        <div className="education-meta">
          {education.meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

function SocialProof() {
  return (
    <section className="social-proof">
      <p className="section-label">MESSAGES / PLACEHOLDERS</p>
      <div className="proof-strip">
        {[...socialProof, ...socialProof].map((quote, index) => (
          <blockquote key={`${quote}-${index}`}>
            <p>«{quote}»</p>
            <span>REPLACE WITH REAL DM</span>
          </blockquote>
        ))}
      </div>
    </section>
  )
}

function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <section className="faq-v3" id="faq">
      <div>
        <p className="section-label">FAQ / 05</p>
        <h2>ПО ДЕЛУ.</h2>
      </div>
      <div className="faq-list">
        {faq.map(([question, answer], index) => (
          <article className={open === index ? 'open' : ''} key={question}>
            <button
              type="button"
              aria-expanded={open === index}
              onClick={() => {
                const next = open === index ? -1 : index
                setOpen(next)
                if (next >= 0) track('faq_open', { question })
              }}
            >
              <span>0{index + 1}</span>
              <strong>{question}</strong>
              <i>{open === index ? '−' : '+'}</i>
            </button>
            <div className="faq-answer">
              <p>{answer}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function FinalChoice({ openPanel }) {
  return (
    <section className="final-choice">
      <div className="choice client">
        <p>CLIENTS / MOSCOW</p>
        <h2>
          ХОЧУ
          <br />
          <em>К ЖЕНЕ</em>
        </h2>
        <button
          className="text-link"
          data-cursor="OPEN"
          onClick={() => {
            track('booking_click', { source: 'final' })
            openPanel('booking', 'final')
          }}
        >
          ЗАПИСАТЬСЯ <span>→</span>
        </button>
      </div>
      <div className="choice pro">
        <p>PROFESSIONALS / FIRST STREAM</p>
        <h2>
          ХОЧУ
          <br />
          <em>УЧИТЬСЯ</em>
        </h2>
        <button
          className="text-link"
          data-cursor="JOIN"
          onClick={() => {
            track('education_waitlist_click', { source: 'final' })
            openPanel('education', 'final')
          }}
        >
          В ЛИСТ ОЖИДАНИЯ <span>→</span>
        </button>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer>
      <strong>ZHENYA LEBEDEV</strong>
      <span>MOSCOW</span>
      <a href={site.instagram} target="_blank" rel="noreferrer" onClick={() => track('instagram_click')}>
        {site.instagramLabel} ↗
      </a>
      <a href="#services">BOOKING</a>
      <a href="#education">EDUCATION</a>
      <small>© 2026 · CONCEPT</small>
    </footer>
  )
}

function ActionPanel({ panel, close }) {
  const [sent, setSent] = useState(false)
  useEffect(() => {
    setSent(false)
    document.body.classList.toggle('panel-open', Boolean(panel))
    return () => document.body.classList.remove('panel-open')
  }, [panel])
  useEffect(() => {
    const key = (event) => event.key === 'Escape' && close()
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [close])
  if (!panel) return null
  const educationMode = panel.type === 'education'
  const submit = (event) => {
    event.preventDefault()
    track(educationMode ? 'education_waitlist_submit' : 'booking_submit', {
      source: panel.source,
      demo: true,
    })
    setSent(true)
  }
  return (
    <div className="panel-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <aside className={`action-panel ${educationMode ? 'education-mode' : ''}`} role="dialog" aria-modal="true" aria-labelledby="panel-title">
        <button className="panel-close" onClick={close}>
          CLOSE ×
        </button>
        {sent ? (
          <div className="panel-success">
            <p>DEMO / LOCAL STATE</p>
            <h2>{educationMode ? 'ВЫ В СПИСКЕ.' : 'СООБЩЕНИЕ ГОТОВО.'}</h2>
            <span>В production-версии данные будут отправлены Игорю или в лист ожидания. Сейчас ничего не отправлено.</span>
            <button className="text-link" onClick={close}>
              ВЕРНУТЬСЯ <b>→</b>
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="section-label">{educationMode ? 'FIRST STREAM / WAITLIST' : 'BOOKING / REQUEST'}</p>
            <h2 id="panel-title">{educationMode ? 'ХОЧУ УЧИТЬСЯ.' : 'ХОЧУ К ЖЕНЕ.'}</h2>
            <label>
              ИМЯ
              <input required name="name" autoComplete="name" />
            </label>
            <label>
              TELEGRAM / ТЕЛЕФОН
              <input required name="contact" />
            </label>
            {educationMode ? (
              <label>
                ОПЫТ
                <select required defaultValue="">
                  <option value="" disabled>
                    Выберите
                  </option>
                  <option>Начинаю</option>
                  <option>1–3 года</option>
                  <option>3+ лет</option>
                </select>
              </label>
            ) : (
              <>
                <label>
                  ЧТО ХОЧЕТСЯ ИЗМЕНИТЬ
                  <textarea required name="request" rows="3" />
                </label>
                <label className="upload">
                  ФОТО ВОЛОС
                  <input type="file" accept="image/*" />
                  <span>ПРИКРЕПИТЬ →</span>
                </label>
              </>
            )}
            <button className="panel-submit" type="submit">
              {educationMode ? 'В ЛИСТ ОЖИДАНИЯ' : 'ПОДГОТОВИТЬ СООБЩЕНИЕ'} →
            </button>
            <small>Demo only. Форма хранит состояние только на устройстве.</small>
          </form>
        )}
      </aside>
    </div>
  )
}

function Cursor() {
  const ref = useRef(null)
  useEffect(() => {
    if (!matchMedia('(pointer:fine)').matches) return
    const move = (event) => {
      if (ref.current) {
        ref.current.dataset.visible = 'true'
        ref.current.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`
      }
    }
    const over = (event) => {
      if (ref.current) ref.current.dataset.mode = event.target.closest('[data-cursor]')?.dataset.cursor || ''
    }
    addEventListener('pointermove', move, { passive: true })
    document.addEventListener('mouseover', over)
    return () => {
      removeEventListener('pointermove', move)
      document.removeEventListener('mouseover', over)
    }
  }, [])
  return <div className="cursor" ref={ref} aria-hidden="true" />
}

export default function App() {
  const [panel, setPanel] = useState(null)
  const closePanel = useCallback(() => setPanel(null), [])
  const openPanel = (type, source) => setPanel({ type, source })
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('in-view')), { threshold: 0.12, rootMargin: '0px 0px -5%' })
    document.querySelectorAll('.reveal,.reveal-image').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return (
    <>
      <Loader />
      <Header openPanel={openPanel} />
      <main>
        <Hero openPanel={openPanel} />
        <Works />
        <About />
        <Services openPanel={openPanel} />
        <Education openPanel={openPanel} />
        <SocialProof />
        <FAQ />
        <FinalChoice openPanel={openPanel} />
      </main>
      <Footer />
      <button className="sticky-book" onClick={() => openPanel('booking', 'sticky')}>
        ЗАПИСАТЬСЯ →
      </button>
      <ActionPanel panel={panel} close={closePanel} />
      <Cursor />
    </>
  )
}
