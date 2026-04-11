import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BackgroundOrbs,
  bodyTextClass,
  cn,
  displayFontClass,
  frameClass,
  GlassPanel,
  insetCardClass,
  pillClass,
  secondaryButtonClass,
  sectionLabelClass,
  shellClass,
} from '../components/Surface.jsx'

const pipelineStages = [
  {
    title: 'Sourcing',
    value: '42',
    detail: 'Candidates gathered from inbound and outbound efforts this week.',
  },
  {
    title: 'Screening',
    value: '15',
    detail: 'Profiles are being scored and reviewed for recruiter fit.',
  },
  {
    title: 'Interviews',
    value: '08',
    detail: 'Live conversations ready for notes, decisions, and next actions.',
  },
]

const quickSignals = [
  'Top-of-funnel quality is up 18% compared with last week.',
  'Candidate response times are strongest between 9 AM and 1 PM.',
  'The design role is closest to final-round readiness.',
]

const actionBoard = [
  {
    title: 'Review candidate notes',
    description: 'Capture interview feedback while context is still fresh.',
  },
  {
    title: 'Schedule next round',
    description: 'Turn strong signals into momentum before the pipeline cools.',
  },
  {
    title: 'Share decision snapshot',
    description: 'Give stakeholders a clean, current view of hiring progress.',
  },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const savedUser = localStorage.getItem('user')
  let user = null

  if (savedUser) {
    try {
      user = JSON.parse(savedUser)
    } catch {
      user = null
    }
  }

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true })
    }
  }, [navigate, user])

  function handleLogout() {
    localStorage.removeItem('user')
    navigate('/', { replace: true })
  }

  if (!user) {
    return null
  }

  const firstName = user?.name?.trim()?.split(' ')[0] || 'there'
  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : 'HX'

  return (
    <div className={cn(shellClass)}>
      <BackgroundOrbs />
      <div className={cn(frameClass, 'px-6 py-10')}>
        <header className="mb-10 flex items-center justify-between">
          <h1 className={cn(displayFontClass, 'text-3xl font-bold')}>
            Welcome back, {firstName}!
          </h1>
          <button
            onClick={handleLogout}
            className={cn(secondaryButtonClass)}
          >
            Logout
          </button>
        </header>
      </div>
    </div>

  )
}
