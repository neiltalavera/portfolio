import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import morrowHome from '../projects/morrowlog/home_page.PNG'
import morrowBlog from '../projects/morrowlog/blog_page.PNG'
import gymHero from '../projects/gym/hero.PNG'
import gymScroll from '../projects/gym/scrolling.PNG'
import './styles.css'

type ProjectId = 'morrowlog' | 'gym'
type Shot = { id: string; project: ProjectId; src: string; alt: string; view: string; imageHeightRatio: number }
type CareerItem = { id: string; role: string; company: string; dates: string; detail: string; bullets: string[] }

const profile = import.meta.env.PUBLIC_PROFILE
const limits = import.meta.env.PUBLIC_CONTACT_LIMITS

const shots: Shot[] = [
  { id: 'morrow-home', project: 'morrowlog', src: morrowHome, alt: 'Morrowlog reading room with community posts', view: 'Reading room', imageHeightRatio: 960 / 1266 },
  { id: 'morrow-post', project: 'morrowlog', src: morrowBlog, alt: 'Morrowlog community post detail page', view: 'Post detail', imageHeightRatio: 960 / 1266 },
  { id: 'gym-home', project: 'gym', src: gymHero, alt: 'Evogym tutorial project home page', view: 'Home page', imageHeightRatio: 974 / 1250 },
  { id: 'gym-classes', project: 'gym', src: gymScroll, alt: 'Evogym tutorial project classes section', view: 'Classes section', imageHeightRatio: 974 / 1250 },
]

const career: CareerItem[] = [
  {
    id: 'cwt', role: 'Senior Software Engineer', company: 'CWT', dates: 'Jan 2023 to present',
    detail: 'I was absorbed by CWT after joining through Collabera. Since then, I have built 10+ greenfield solutions to solve business needs, from enterprise integrations to data-processing tools and replacements for costly legacy systems.',
    bullets: [
      'Built 10+ greenfield solutions across my CWT career to meet business needs.',
      'Delivered Java integration systems for Oracle HCM Cloud using scheduled JARs, JBoss, Tomcat, and Spring Boot.',
      'Replaced a high-volume data-loader bottleneck, cutting delivery time from about three months to about 10 days.',
      'Migrated 15+ projects and shared libraries from Java 8 to Java 17.',
      'Led a SOAP-to-REST migration with no production disruption.',
      'Deployed and supported containerized applications on AWS with CI/CD.',
      'Resolved memory leaks and Java out-of-memory errors to improve performance and throughput.',
      'Currently leading an in-progress Spring Boot, React, and TypeScript project to replace a high-cost legacy system.',
    ],
  },
  {
    id: 'collabera', role: 'Senior Software Engineer', company: 'Collabera', dates: 'Apr 2022 to Jan 2023',
    detail: 'Collabera is a recruiting and staffing company. I was deployed to CWT through Collabera, then absorbed by CWT not long after.',
    bullets: [
      'Supported Oracle HCM operations, Tier 2 issue analysis, and configuration work.',
      'Designed SQL data models and Oracle BI reports for HR analytics.',
      'Supported data analysis for CWT rebranding and helped keep records consistent.',
      'Built Java and Spring backend features for Hotel Development MVP work.',
    ],
  },
  {
    id: 'sandstone', role: 'Associate Software Engineer', company: 'Sandstone Technology', dates: 'Nov 2019 to Apr 2022',
    detail: 'Worked on a core banking SaaS product, maintaining its core module and improving automated document generation.',
    bullets: [
      'Delivered feature improvements, fixes, and maintenance for a proprietary core banking SaaS product.',
      'Improved automated banking document generation with Docx4j.',
    ],
  },
  {
    id: 'green', role: 'Junior Systems Developer', company: 'Green AdvancedTech Solution', dates: 'Jun 2017 to Nov 2019',
    detail: 'Modernized an intranet system and worked on a hospital information system.',
    bullets: [
      'Rebuilt core parts of a legacy intranet to improve its structure and usability.',
      'Worked on interface and workflow improvements.',
      'Built and maintained features for nurse-related hospital operations.',
      'Helped train and onboard new engineers.',
    ],
  },
  {
    id: 'intern', role: 'Intern', company: 'Systems and Software Consulting Group', dates: '2016',
    detail: 'Built an FAQ module for an enterprise system and joined solution design discussions.',
    bullets: [
      'Designed and delivered an FAQ module for an enterprise system.',
      'Joined technical discussions and solution design with developers and team leads.',
    ],
  },
]

const skillGroups = [
  { label: 'Backend', items: 'Java 8–17 · Spring Boot · REST APIs · Python · FastAPI' },
  { label: 'Cloud and delivery', items: 'AWS · Docker · CI/CD · Cloudflare · Production support' },
  { label: 'Data and messaging', items: 'Oracle · PostgreSQL · MySQL · Kafka · ActiveMQ' },
  { label: 'Frontend', items: 'React · TypeScript · Vite · Tailwind CSS' },
]

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" className={diagonal ? 'arrow-icon arrow-icon--diagonal' : 'arrow-icon'} viewBox="0 0 20 20" fill="none"><path d="M3.5 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function ExternalLink({ href, children, className = '' }: { href?: string; children: ReactNode; className?: string }) {
  if (!href) return null
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}<Arrow diagonal /></a>
}

function App() {
  const [queue, setQueue] = useState(shots)
  const [phase, setPhase] = useState<'idle' | 'forward' | 'back-prepare' | 'back-settle'>('idle')
  const [incomingId, setIncomingId] = useState<string | null>(null)
  const [pan, setPan] = useState(-15)
  const [expandedRole, setExpandedRole] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [formStatus, setFormStatus] = useState('')
  const [sending, setSending] = useState(false)
  const busyRef = useRef(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const queueRef = useRef(shots)
  const titleRef = useRef<HTMLInputElement>(null)
  const reducedMotionRef = useRef(false)
  const timerRef = useRef<number | undefined>(undefined)
  const activeShot = queue[0]
  const isMorrowlog = activeShot.project === 'morrowlog'

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => { reducedMotionRef.current = query.matches }
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= 18) return
      event.preventDefault()
      if (!busyRef.current) changeCard(event.deltaY > 0 ? 1 : -1)
    }
    frame.addEventListener('wheel', onWheel, { passive: false })
    return () => frame.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  function commitRotation(direction: 1 | -1) {
    const current = queueRef.current
    const next = direction > 0 ? [...current.slice(1), current[0]] : [current[current.length - 1], ...current.slice(0, -1)]
    queueRef.current = next
    setQueue(next)
  }

  function changeCard(direction: 1 | -1) {
    if (busyRef.current) return
    busyRef.current = true
    setPan(-15)
    if (reducedMotionRef.current) {
      commitRotation(direction)
      setPhase('idle')
      busyRef.current = false
      return
    }
    if (direction > 0) {
      setPhase('forward')
      timerRef.current = window.setTimeout(() => {
        commitRotation(1)
        setPhase('idle')
        busyRef.current = false
      }, 460)
      return
    }
    setIncomingId(queueRef.current[queueRef.current.length - 1].id)
    setPhase('back-prepare')
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      commitRotation(-1)
      setPhase('back-settle')
      timerRef.current = window.setTimeout(() => {
        setPhase('idle')
        setIncomingId(null)
        busyRef.current = false
      }, 460)
    }))
  }

  function panScreenshot(event: PointerEvent<HTMLDivElement>) {
    if (reducedMotionRef.current || event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
    setPan(-15 - y * 45)
  }

  function handleFrameKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      event.preventDefault()
      changeCard(1)
    } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      event.preventDefault()
      changeCard(-1)
    }
  }

  function requestCv() {
    setTitle('Request full CV')
    window.setTimeout(() => titleRef.current?.focus(), 450)
  }

  async function sendContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setSending(true)
    setFormStatus('Sending your message…')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: String(data.get('email') ?? '').slice(0, limits.email),
          title: String(data.get('title') ?? '').slice(0, limits.title),
          message: String(data.get('message') ?? '').slice(0, limits.message),
        }),
      })
      if (!response.ok) throw new Error('Could not send your message.')
      form.reset()
      setTitle('')
      setFormStatus('Thanks. Your message was sent.')
    } catch {
      setFormStatus('Your message could not be sent. Please try again later.')
    } finally {
      setSending(false)
    }
  }

  const project = isMorrowlog
    ? {
        title: 'Morrowlog',
        description: 'Morrowlog is a live community blog I built to show full-stack delivery across cloud services. Its Vite, React, and TypeScript frontend connects to a Python backend built with FastAPI. PostgreSQL stores the app data.',
        stack: ['Vite', 'React', 'TypeScript', 'Python', 'FastAPI', 'SQLAlchemy', 'PostgreSQL'],
        liveUrl: profile.morrowlog,
        repoLinks: [
          { label: 'Frontend code', href: 'https://github.com/neiltalavera/simple-blog-frontend' },
          { label: 'Backend code', href: 'https://github.com/neiltalavera/simple-blog-backend' },
        ],
      }
    : {
        title: 'Gym TypeScript',
        description: 'A React and TypeScript practice project based on a tutorial. I used it to learn the stack and make my first Cloudflare Pages deployment.',
        stack: ['React', 'TypeScript', 'Vite', 'Cloudflare Pages'],
        liveUrl: profile.gymTypescript,
        repoLinks: [{ label: 'Source code', href: 'https://github.com/neiltalavera/gym-typescript' }],
      }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <div className="page-wrap nav-wrap">
        <a href="#top" className="wordmark" aria-label="Neil Talavera, back to top"><span className="wordmark-mark">N</span><span>Neil Talavera</span></a>
        <nav aria-label="Main navigation" className="main-nav"><a href="#work">Work</a><a href="#experience">Experience</a><a href="#skills">Skills</a></nav>
        <a className="nav-contact" href="#contact">Get in touch <Arrow /></a>
      </div>
    </header>

    <main id="main">
      <section className="hero section-screen" id="top" aria-labelledby="hero-title" data-enter>
        <div className="page-wrap hero-grid"><div className="hero-copy">
          <h1 id="hero-title">Hi, I’m Neil Earvin Talavera</h1>
          <p className="hero-lead">I build software solutions that solve business needs, from new enterprise systems to full-stack applications. I also modernize existing software, connect services, and help teams take reliable products into production.</p>
          <div className="hero-actions"><a className="button button--primary" href="#work">View selected work <Arrow /></a><a className="button button--text" href="#contact">Get in touch <Arrow /></a></div>
        </div></div>
        <a className="scroll-cue" href="#work"><span>Scroll to selected work</span><span className="scroll-line" /></a>
      </section>

      <section className="work section-screen" id="work" aria-labelledby="work-title">
        <div className="page-wrap">
          <div className="section-heading"><div><h2 id="work-title">A live app, built end to end.</h2></div></div>
          <div className="project-grid">
            <div role="group" className={`work-canvas ${phase !== 'idle' ? `is-${phase}` : ''}`} ref={frameRef} tabIndex={0} onKeyDown={handleFrameKeyDown} aria-label="Project screenshot stack. Use the arrow keys to change views.">
              <div className="canvas-topline"><span><span className="canvas-dot" /> {isMorrowlog ? 'Morrowlog' : 'Gym TypeScript'}</span><span>{String(shots.findIndex((shot) => shot.id === activeShot.id) + 1).padStart(2, '0')} / 04</span></div>
              <div className="stack-stage" aria-live="off">{queue.map((shot, index) => {
                const style = {
                  '--stack-index': index,
                  '--stack-y': `${index * 24}px`,
                  '--stack-scale': 1 - index * 0.05,
                  '--screenshot-pan': `${pan}%`,
                  '--image-height': `${shot.imageHeightRatio * 100}cqw`,
                  zIndex: 10 - index,
                } as CSSProperties
                const isIncoming = shot.id === incomingId
                const classes = ['stack-card', index === 0 ? 'is-active' : '', phase === 'forward' && index === 0 ? 'is-departing' : '', phase === 'back-prepare' && isIncoming ? 'is-back-prepare' : '', phase === 'back-settle' && isIncoming ? 'is-back-settle' : ''].filter(Boolean).join(' ')
                return <div className={classes} style={style} key={shot.id} aria-hidden={index !== 0} onPointerMove={index === 0 ? panScreenshot : undefined} onPointerLeave={index === 0 ? () => setPan(-15) : undefined}>
                  <div className="screenshot-window"><div className="window-bar" aria-hidden="true"><span /><span /><span /><i>{shot.project === 'morrowlog' ? 'morrowlog' : 'evogym'}</i></div>
                    <div className="screenshot-viewport"><div className="screenshot-pan"><img src={shot.src} alt={index === 0 ? shot.alt : ''} draggable="false" /></div></div>
                  </div>
                </div>
              })}</div>
              <div className="canvas-controls"><span className="canvas-hint">Scroll here to browse</span><div className="control-pair">
                <button className="step-button" type="button" aria-label="Show previous project view" onClick={() => changeCard(-1)}><span aria-hidden="true">←</span></button>
                <button className="step-button" type="button" aria-label="Show next project view" onClick={() => changeCard(1)}><span aria-hidden="true">→</span></button>
              </div></div>
              <span className="sr-only" aria-live="polite">{project.title}, {activeShot.view}, view {shots.findIndex((shot) => shot.id === activeShot.id) + 1} of 4</span>
            </div>
            <div className="project-copy" aria-live="polite"><h3>{project.title}</h3><p className="project-description">{project.description}</p>
              <div className="stack-list" aria-label="Project technology stack">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
              <div className="project-links"><ExternalLink className="project-live" href={project.liveUrl}>Open live app</ExternalLink>{project.repoLinks.map((link) => <ExternalLink key={link.href} href={link.href}>{link.label}</ExternalLink>)}</div>
              <div className="project-note"><span className="note-marker" aria-hidden="true">↳</span><p>{isMorrowlog ? 'Cloudflare Workers serves the frontend. AWS Lambda runs the API. Neon hosts the database.' : 'An early learning project and my first Cloudflare Pages deployment.'}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="experience section-screen" id="experience" aria-labelledby="experience-title">
        <div className="page-wrap experience-layout"><div className="experience-lead"><h2 id="experience-title">Experience across enterprise systems.</h2><p>My roles span core banking, hospital software, HR systems, and cloud integrations.</p><a className="text-link" href="#contact" onClick={requestCv}>Request for full CV <Arrow /></a></div>
          <ol className="career-list">{career.map((item, index) => <li key={item.id} className={`career-row ${expandedRole === item.id ? 'is-expanded' : ''}`}>
            <button type="button" className="career-toggle" aria-expanded={expandedRole === item.id} aria-controls={`career-${item.id}`} onClick={() => setExpandedRole(expandedRole === item.id ? null : item.id)}>
              <span className="career-index">0{index + 1}</span><span className="career-main"><span className="career-role">{item.role}</span><span className="career-company">{item.company}</span><span className="career-detail">{item.detail}</span></span><span className="career-dates">{item.dates}<span className="career-indicator" aria-hidden="true">{expandedRole === item.id ? '−' : '+'}</span></span>
            </button><div className="career-panel" id={`career-${item.id}`} aria-hidden={expandedRole !== item.id}><ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></div>
          </li>)}</ol>
          <div className="education-note experience-education"><span>EDUCATION</span><p>BS Computer Engineering<br />Adamson University · 2012–2017</p></div>
        </div>
      </section>

      <section className="skills section-screen" id="skills" aria-labelledby="skills-title"><div className="page-wrap skills-layout">
        <div className="skills-heading"><h2 id="skills-title">Backend depth. Full-stack range.</h2><p>Most of my experience is in Java and enterprise systems. I also build with React and TypeScript, and work across cloud deployment and data services.</p></div>
        <div className="skill-groups">{skillGroups.map((group) => <div className="skill-row" key={group.label}><h3>{group.label}</h3><p>{group.items}</p></div>)}<div className="skill-row skill-row--leadership"><h3>Engineering practice</h3><p>Software development · System design · Code review · Production support · Technical mentoring</p></div></div>
      </div></section>

      <section className="contact section-screen" id="contact" aria-labelledby="contact-title"><div className="page-wrap contact-inner">
        <h2 id="contact-title">Let’s talk about the systems you need to ship.</h2><p className="contact-copy">You can connect with me on LinkedIn or GitHub, or send a message here.</p>
        <div className="contact-actions"><ExternalLink className="button button--outline" href={profile.linkedIn}>Connect on LinkedIn</ExternalLink><ExternalLink className="button button--outline" href={profile.github}>View GitHub</ExternalLink></div>
        <form className="contact-form" onSubmit={sendContact}>
          <label className="contact-email-field">Email<input name="email" type="email" required maxLength={limits.email} autoComplete="email" placeholder="I’ll reply to this email address" /></label>
          <label>Title<input ref={titleRef} name="title" type="text" required maxLength={limits.title} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What is this about?" /></label>
          <label>Message<textarea name="message" required maxLength={limits.message} rows={6} placeholder="Write your message here" /></label>
          <div className="contact-form-bottom"><button className="button button--primary" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send'} <Arrow /></button></div>
          <p className="form-status" aria-live="polite">{formStatus}</p>
        </form>
        <div className="contact-footer"><span>Neil Earvin C. Talavera</span><a href="#top">Back to top ↑</a></div>
      </div></section>
    </main>
  </>
}

export default App
