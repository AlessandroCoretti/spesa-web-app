import { motion } from 'framer-motion'
import { STATUSES, STATUS_META } from '../../store/statuses'
import { StatusIcon } from '../common/IconSet/StatusIcon'
import { colorTokens } from '../../styles/colorTokens'

export function StatusPicker({ value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink-soft">Stato *</p>
      <div className="grid grid-cols-2 gap-2.5">
        {STATUSES.map((status) => {
          const meta = STATUS_META[status]
          const tokens = colorTokens(meta.color)
          const selected = value === status
          return (
            <motion.button
              key={status}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(status)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-3 transition-colors ${
                selected ? `${tokens.bg100} ${tokens.border}` : 'border-transparent bg-blush-50'
              }`}
            >
              <span className={selected ? tokens.text : 'text-ink-soft'}>
                <StatusIcon icon={meta.icon} className="h-7 w-7" />
              </span>
              <span className={`text-sm font-semibold ${selected ? tokens.text : 'text-ink-soft'}`}>
                {meta.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
