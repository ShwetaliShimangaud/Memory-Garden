'use client'

import { useState, useMemo, FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import { motion } from 'framer-motion'
import classNames from 'classnames'

const TAG_OPTIONS = ['funny', 'deep', 'sweet', 'annoying but cute']
const MOOD_OPTIONS = ['happy', 'silly', 'bittersweet', 'nostalgic']



export default function NewMemoryPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [date, setDate] = useState<Date | null>(null)
  const [location, setLocation] = useState('')
  const [mood, setMood] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [spotify, setSpotify] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /* ---------- helpers ---------- */

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setPhoto(file || null)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  /** crude spotify validator – checks open.spotify.com */
  const isSpotify = useMemo(
    () => spotify && /open\.spotify\.com/.test(spotify),
    [spotify]
  )

  /* ---------- submit ---------- */

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let image_url: string | null = null
      if (photo) {
        const ext = photo.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${ext}`
        const { data, error: upErr } = await supabase.storage
          .from('memory-images')
          .upload(fileName, photo)
        if (upErr) throw upErr
        image_url = data?.path ?? null
      }

      const { error: insErr } = await supabase.from('memories').insert({
        title,
        content,
        tags,
        date: date ? date.toISOString().slice(0, 10) : null,
        location: location || null,
        mood: mood || null,
        image_url,
        spotify: spotify || null,
      })
      if (insErr) throw insErr

      
      localStorage.setItem('justAddedMemory', 'true')
      router.push('/')   // <— send user straight to the visual

    } catch (err: any) {
      setError(err.message || 'Failed to save memory')
    } finally {
      setLoading(false)
    }
  }

  /* ---------- UI ---------- */

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-rose-900">Add a New Memory</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* title & content */}
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-white/60 rounded-xl px-4 py-3 border border-rose-200 focus:border-fuchsia-500 focus:ring-fuchsia-200"
        />
        <textarea
          placeholder="I remember when..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full h-32 bg-white/60 rounded-xl px-4 py-3 border border-rose-200 focus:border-fuchsia-500 focus:ring-fuchsia-200"
        />

        {/* tags */}
        <section>
          <p className="font-medium mb-2 text-rose-800">Tags</p>
          <div className="flex flex-wrap gap-3">
            {TAG_OPTIONS.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => toggleTag(tag)}
                className={classNames(
                  'px-3 py-1 rounded-full text-sm border transition',
                  tags.includes(tag)
                    ? 'bg-fuchsia-600 text-white border-fuchsia-600 shadow'
                    : 'border-fuchsia-300 text-fuchsia-600 hover:bg-fuchsia-50'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* date & location */}
        <div className="grid sm:grid-cols-2 gap-4">
          <DatePicker
            selected={date}
            onChange={(d) => setDate(d)}
            placeholderText="Pick a date"
            className="w-full bg-white/60 rounded-xl px-4 py-3 border border-rose-200 focus:border-fuchsia-500"
          />
          <input
            type="text"
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-white/60 rounded-xl px-4 py-3 border border-rose-200 focus:border-fuchsia-500"
          />
        </div>

        {/* mood select */}
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="w-full bg-white/60 rounded-xl px-4 py-3 border border-rose-200 focus:border-fuchsia-500"
        >
          <option value="">Select Mood (optional)</option>
          {MOOD_OPTIONS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        {/* photo uploader */}
        <section className="space-y-2">
          <p className="font-medium text-rose-800">Photo</p>
          <label
            htmlFor="photo"
            className="w-full h-40 flex items-center justify-center bg-white/50 rounded-xl border-2 border-dashed border-fuchsia-400 text-fuchsia-600 cursor-pointer hover:bg-fuchsia-50"
          >
            {preview ? (
              <motion.img
                key={preview}
                src={preview}
                alt="preview"
                className="h-full w-full object-cover rounded-xl"
                initial={{ opacity: 0.1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
            ) : (
              'Click or drag a file here'
            )}
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
            />
          </label>
        </section>

        {/* Spotify */}
        <section className="space-y-2">
          <input
            type="url"
            placeholder="Spotify link (optional)"
            value={spotify}
            onChange={(e) => setSpotify(e.target.value)}
            className="w-full bg-white/60 rounded-xl px-4 py-3 border border-rose-200 focus:border-fuchsia-500"
          />
          {isSpotify && (
            <iframe
              src={spotify.replace(
                /open\.spotify\.com\/(track|album|playlist)\//,
                'open.spotify.com/embed/$1/'
              )}
              width="100%"
              height="80"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg border border-rose-200"
            />
          )}
        </section>

        {/* error */}
        {error && <p className="text-red-600">{error}</p>}

        {/* submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-fuchsia-600 text-white px-8 py-3 rounded-xl font-semibold shadow hover:bg-fuchsia-700 active:scale-95 transition"
        >
          {loading ? 'Saving…' : 'Save Memory'}
        </button>
      </form>
    </div>
  )
}
