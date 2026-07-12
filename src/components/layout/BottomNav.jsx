import { NavLink, useParams } from 'react-router'
import { motion } from 'framer-motion'
import { STATUSES, STATUS_META } from '../../store/statuses'
import { StatusIcon } from '../common/IconSet/StatusIcon'
import { colorTokens } from '../../styles/colorTokens'

export function BottomNav() {
  const { listId } = useParams()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-blush-100 bg-white/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm">
      <ul className="flex items-stretch justify-between gap-1">
        {STATUSES.map((status) => {
          const meta = STATUS_META[status]
          const tokens = colorTokens(meta.color)
          return (
            <li key={status} className="flex-1">
              <NavLink
                to={`/list/${listId}/${status}`}
                className="relative flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[11px] font-semibold text-ink-soft"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="bottom-nav-active"
                        className={`absolute inset-0 rounded-2xl ${tokens.bg100}`}
                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      />
                    )}
                    <span className={`relative z-10 ${isActive ? tokens.text : 'text-ink-soft'}`}>
                      <StatusIcon icon={meta.icon} className="h-6 w-6" />
                    </span>
                    <span className={`relative z-10 leading-tight ${isActive ? tokens.text : ''}`}>
                      {meta.short}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
