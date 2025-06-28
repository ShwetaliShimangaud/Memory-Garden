// MemoryTree.tsx – distribute blossoms along each branch & refined connected‑petal flower shape
'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import * as d3 from 'd3'
import confetti from 'canvas-confetti'
import { Dialog } from '@headlessui/react'

/** ------------------------------------------------------------------
 * Types & constants
 * ------------------------------------------------------------------*/

type Memory = {
  id: string
  title: string | null
  content: string
  mood: string | null
  date: string | null
  tags: string[]
}

const moodColor: Record<string, string> = {
  happy: '#f9a8d4',
  silly: '#fb923c',
  bittersweet: '#c084fc',
  nostalgic: '#5eead4',
  default: '#F9A825',
}

const SVG_W = 320
const SVG_H = 380
const GROUND_Y = SVG_H - 30

/** ------------------------------------------------------------------
 * Individual SVG tree (≤20 memories) – draws branches + blossoms
 * ------------------------------------------------------------------*/

interface TreeSvgProps {
  memories: Memory[]
  onSelect: (m: Memory) => void
}

function TreeSvg({ memories, onSelect }: TreeSvgProps) {
  const ref = useRef<SVGSVGElement>(null)

  const draw = useCallback(() => {
    const svgEl = ref.current
    if (!svgEl) return

    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()
    svg
      .attr('width', SVG_W)
      .attr('height', SVG_H)
      .attr('viewBox', `0 0 ${SVG_W} ${SVG_H}`)

    /* 🟫 ground + trunk */
    svg
      .append('rect')
      .attr('x', 0)
      .attr('y', GROUND_Y)
      .attr('width', SVG_W)
      .attr('height', SVG_H - GROUND_Y)
      .attr('fill', '#BDE0FE')

    svg
      .append('path')
      .attr(
        'd',
        `M${SVG_W / 2} ${GROUND_Y} Q${SVG_W / 2} ${GROUND_Y - 60} ${SVG_W / 2} ${GROUND_Y - 120}`
      )
      .attr('stroke', '#8B5A2B')
      .attr('stroke-width', 12)
      .attr('stroke-linecap', 'round')
      .attr('fill', 'none')

    const branches = Math.min(Math.ceil(memories.length / 4), 5)
    const angleScale = d3.scaleLinear<number>().domain([0, branches - 1]).range([-60, 60])
    const lengthScale = d3.scaleLinear<number>().domain([0, branches - 1]).range([120, 160])

    /** Helper: quadratic Bézier point + tangent */
    const quadPoint = (
      t: number,
      x0: number,
      y0: number,
      cx: number,
      cy: number,
      x1: number,
      y1: number
    ) => [
      (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1,
      (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1,
    ] as [number, number]

    const quadTangent = (
      t: number,
      x0: number,
      y0: number,
      cx: number,
      cy: number,
      x1: number,
      y1: number
    ) => [
      2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx),
      2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy),
    ] as [number, number]

    /** Iterate each branch (max 5) */
    Array.from({ length: branches }).forEach((_, bIdx) => {
      const branchMems = memories.slice(bIdx * 4, (bIdx + 1) * 4)
      if (branchMems.length === 0) return

      /* 🪄 calculate curve */

// Convert degrees to radians
      const baseAngle = ((bIdx+1) * (360 / (branches+1)) * Math.PI) / 180 - Math.PI / 2


      const branchLen = lengthScale(bIdx) + d3.randomUniform(-5, 5)()

      const startX = SVG_W / 2
      const startY = GROUND_Y - 120
      const endX = startX + branchLen * Math.cos(baseAngle)
      const endY = startY - branchLen * Math.sin(baseAngle)
      const ctrlX = startX + branchLen * 0.5 * Math.cos(baseAngle)
      const ctrlY = startY - branchLen * 0.5 * Math.sin(baseAngle) + d3.randomUniform(-20, 20)()

      /* 🌿 branch path */
      svg
        .append('path')
        .attr('d', `M${startX} ${startY} Q${ctrlX} ${ctrlY} ${endX} ${endY}`)
        .attr('stroke', '#8B5A2B')
        .attr('stroke-width', 6)
        .attr('stroke-linecap', 'round')
        .attr('fill', 'none')

      /* 🍃 a leaf midway for depth */
      // svg
      //   .append('circle')
      //   .attr('cx', ctrlX + d3.randomUniform(-8, 8)())
      //   .attr('cy', ctrlY + d3.randomUniform(-8, 8)())
      //   .attr('r', 6)
      //   .attr('fill', '#3FA34D')
      //   .attr('opacity', 0.6)

      /* 🌸 blossoms distributed *along* branch */
      branchMems.forEach((mem, fIdx) => {
        let fx = 0, fy = 0

      if (fIdx === branchMems.length - 1) {
        // Place one flower at the tip
          fx = endX
          fy = endY
        } else {
          const reverseIdx = branchMems.length - fIdx
          const t = reverseIdx / (branchMems.length + 1)
          const [px, py] = quadPoint(t, startX, startY, ctrlX, ctrlY, endX, endY)
          const [dx, dy] = quadTangent(t, startX, startY, ctrlX, ctrlY, endX, endY)
          const len = Math.hypot(dx, dy) || 1
          const offset = (fIdx % 2 === 0 ? 10 : -10)
          fx = px + (offset * -dy) / len
          fy = py + (offset * dx) / len
        }

        const g = svg
          .append('g')
          .attr('transform', `translate(${fx}, ${fy})`)
          .style('cursor', 'pointer')
          .on('click', () => onSelect(mem))

        /* connected‑petal flower: build one continuous path */
        const petals = 5
        const petalPath = 'M0,0 C2,-6 6,-6 8,0 C6,3 2,3 0,0 Z'

        for (let i = 0; i < petals; i++) {
          const angle = (i * 360) / petals
          g.append('path')
            .attr('d', petalPath)
            .attr('fill', moodColor[mem.mood ?? 'default'])
            .attr('stroke', '#d1a1d1')
            .attr('stroke-width', 0.3)
            .attr('transform', `rotate(${angle}) translate(4.5, 0)`)
        }

        g.append('circle')
          .attr('r', 2.2)
          .attr('fill', '#FFD700')
      })
    })
  }, [memories, onSelect])

  useEffect(draw, [draw])

  return <svg ref={ref} className="w-80 h-96" />
}

/** ------------------------------------------------------------------
 * Page – fetch memories & render multiple trees
 * ------------------------------------------------------------------*/

export default function GrowthPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [selected, setSelected] = useState<Memory | null>(null)

  /* fetch once */
  useEffect(() => {
    supabase
      .from('memories')
      .select('id,title,content,mood,date,tags')
      .order('created_at')
      .then(({ data, error }) => {
        if (error) console.error('Error fetching memories:', error)
        setMemories(data || [])
      })
  }, [])

  /* confetti on recent add */
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('justAddedMemory')) {
      localStorage.removeItem('justAddedMemory')
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.2 },
        colors: ['#f9a8d4', '#f472b6', '#fb7185'],
        shapes: ['circle'],
        scalar: 1.2,
      })
    }
  }, [])

  /* chunk memories 20/tree */
  const trees: Memory[][] = []
  for (let i = 0; i < memories.length; i += 20) trees.push(memories.slice(i, i + 20))
  if (trees.length === 0) trees.push([]) // at least one empty tree

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-pink-100 via-rose-200 to-purple-200 overflow-x-hidden px-4 py-12">
      <h1 className="text-3xl font-bold text-rose-900 mb-2 flex items-center gap-2">🌸 Memory Garden</h1>
      <p className="text-sm text-rose-800 mb-8">Each blossom represents a memory you’ve saved.</p>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-wrap justify-center gap-8"
      >
        {trees.map((chunk, idx) => (
          <TreeSvg key={idx} memories={chunk} onSelect={setSelected} />
        ))}
      </motion.div>

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
      >
        <Dialog.Panel className="bg-white rounded-xl w-full max-w-md p-6 border border-rose-200 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-rose-900 mb-2">
            {selected?.title ?? 'Untitled Memory'}
          </Dialog.Title>
          <p className="text-sm text-rose-800 whitespace-pre-wrap">{selected?.content}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-rose-500">
            {selected?.date && <>🗓 {selected.date}</>}
            {selected?.tags?.map((t) => <span key={t}>🏷 {t}</span>)}
            {selected?.mood && <>💭 {selected.mood}</>}
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  )
}
