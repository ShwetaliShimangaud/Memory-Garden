'use client'

import { motion } from 'framer-motion'
import MemoryCard from './MemoryCard'

interface Memory {
  id: string
  title: string
  content: string
  date: string | null
  tags: string[]
  mood: string | null
  image_url: string | null
  spotify: string | null
}

interface Props {
  memories: Memory[]
}

export default function MemoriesList({ memories }: Props) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
      }}
      className="space-y-6"
    >
      {memories.map((m) => (
        <motion.div
          key={m.id}
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
        >
          <MemoryCard memory={m} />
        </motion.div>
      ))}
    </motion.div>
  )
}
