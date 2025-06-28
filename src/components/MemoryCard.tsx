// src/components/MemoryCard.tsx
import React from 'react'

export default function MemoryCard({ memory }: { memory: any }) {
  return (
    <article className="bg-white rounded-xl p-6 shadow-md border border-rose-200 hover:shadow-lg transition">
      <h2 className="text-xl font-semibold text-rose-900 mb-2">{memory.title || 'Untitled'}</h2>
      <p className="text-rose-800 mb-3 whitespace-pre-line">{memory.content}</p>
      <p className="text-sm text-rose-600 mb-1">
        {memory.date ? new Date(memory.date).toLocaleDateString() : 'No date'}
        {memory.location ? ` — ${memory.location}` : ''}
      </p>
      {memory.image_url && (
        <img
          src={`https://gnhxmgwwoyojxiygtqlf.supabase.co/storage/v1/object/public/memory-images//${memory.image_url}`}
          alt={memory.title || 'Memory image'}
          className="rounded-lg max-w-full mt-3"
        />
      )}
    </article>
  )
}
