"use client"


import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <main
      className={`relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-12 space-y-8
      bg-gradient-to-tr from-pink-100 via-rose-200 to-purple-200
      transition-opacity duration-1000 ease-in-out
      ${mounted ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Animated decorative icon */}
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute top-8 right-8 w-16 h-16 opacity-20"
      >
        <Image src="/sparkle.svg" alt="Floating sparkle" width={64} height={64} />
      </motion.div>

      {/* Title and Icon */}
      <motion.h1
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-5xl font-extrabold text-rose-900 drop-shadow-md mb-2 flex items-center gap-2"
      >
        💖 I Remember
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xl text-rose-800 max-w-md drop-shadow-sm"
      >
        A little journal of us — one memory at a time.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex gap-6 flex-col sm:flex-row mt-6"
      >
        <Link
          href="/memories"
          className="
            bg-fuchsia-600 text-white px-8 py-4 rounded-xl text-lg font-semibold
            shadow-lg hover:bg-fuchsia-700 hover:shadow-xl transition
            transform hover:-translate-y-1 active:scale-95
            focus:outline-none focus:ring-4 focus:ring-fuchsia-300
          "
        >
          View Memories
        </Link>
        <Link
          href="/memories/new"
          className="
            border-2 border-fuchsia-600 text-fuchsia-600 px-8 py-4 rounded-xl text-lg font-semibold
            hover:bg-fuchsia-600 hover:text-white transition
            transform hover:-translate-y-1 active:scale-95
            focus:outline-none focus:ring-4 focus:ring-fuchsia-300
          "
        >
          Add New Memory
        </Link>

        <Link
          href="/growth"
          className="
            bg-fuchsia-600 text-white px-8 py-4 rounded-xl text-lg font-semibold
            shadow-lg hover:bg-fuchsia-700 hover:shadow-xl transition
            transform hover:-translate-y-1 active:scale-95
            focus:outline-none focus:ring-4 focus:ring-fuchsia-300
          "
        >
          🌸 View Memory Garden
        </Link>

      </motion.div>
    </main>
  )
}