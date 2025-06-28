'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import classNames from 'classnames'
import { motion, AnimatePresence } from 'framer-motion'
import MemoryCard from '@/components/MemoryCard'

const TAG_OPTIONS = ['funny', 'deep', 'sweet', 'annoying but cute']
const MOOD_OPTIONS = ['happy', 'silly', 'bittersweet', 'nostalgic']

type Memory = {
  id: string
  title: string | null
  content: string
  tags: string[]
  date: string | null
  location: string | null
  mood: string | null
  image_url: string | null
  created_at: string
  spotify?: string | null
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedMood, setSelectedMood] = useState('')
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [startDate, endDate] = dateRange

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSelectedTags([])
    setSelectedMood('')
    setDateRange([null, null])
  }

  useEffect(() => {
    const fetchMemories = async () => {
      setLoading(true)

      let query = supabase
        .from('memories')
        .select('*')
        .order('date', { ascending: false })

      if (selectedTags.length) query = query.contains('tags', selectedTags)
      if (selectedMood) query = query.eq('mood', selectedMood)
      if (startDate)
        query = query.gte('date', startDate.toISOString().slice(0, 10))
      if (endDate)
        query = query.lte('date', endDate.toISOString().slice(0, 10))

      const { data, error } = await query
      if (!error) setMemories((data as Memory[]) || [])
      setLoading(false)
    }

    fetchMemories()
  }, [selectedTags, selectedMood, startDate, endDate])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-rose-900 flex items-center gap-2">
        📔 Your Memories
      </h1>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4 bg-white/70 backdrop-blur p-4 rounded-xl border border-rose-200 shadow-sm">
        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={classNames(
                'px-3 py-1 rounded-full text-sm border transition',
                selectedTags.includes(tag)
                  ? 'bg-fuchsia-600 text-white border-fuchsia-600 shadow'
                  : 'border-fuchsia-300 text-fuchsia-600 hover:bg-fuchsia-100'
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Mood */}
        <select
          value={selectedMood}
          onChange={(e) => setSelectedMood(e.target.value)}
          className="px-3 py-2 border rounded-xl text-sm border-rose-300"
        >
          <option value="">All moods</option>
          {MOOD_OPTIONS.map((mood) => (
            <option key={mood} value={mood}>
              {mood}
            </option>
          ))}
        </select>

        {/* Date range */}
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
          isClearable
          placeholderText="Pick a date range"
          className="px-3 py-2 border rounded-xl text-sm border-rose-300"
        />

        {/* Clear button */}
        <button
          onClick={clearFilters}
          className="text-sm text-fuchsia-600 underline hover:text-fuchsia-800 ml-auto"
        >
          Clear
        </button>
      </div>

      {/* Memory Cards */}
      {loading ? (
        <p className="text-rose-600 italic">Loading memories…</p>
      ) : memories.length === 0 ? (
        <p className="text-rose-600 italic">No memories match those filters.</p>
      ) : (
        <AnimatePresence mode="popLayout">
          {memories.map((memory) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <MemoryCard memory={memory} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}
