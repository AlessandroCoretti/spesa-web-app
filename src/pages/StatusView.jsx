import { useParams } from 'react-router'
import { motion } from 'framer-motion'
import { ItemList } from '../components/items/ItemList'
import { Fab } from '../components/common/Fab'
import { useStore } from '../store'
import { STATUSES } from '../store/statuses'

export default function StatusView() {
  const { statusTab } = useParams()
  const openSheet = useStore((state) => state.openSheet)
  const status = STATUSES.includes(statusTab) ? statusTab : 'da_comprare'

  return (
    <>
      <motion.div
        key={status}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <ItemList status={status} />
      </motion.div>
      <Fab onClick={() => openSheet('item-form')} />
    </>
  )
}
