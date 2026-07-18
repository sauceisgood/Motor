'use client'

import { useState } from 'react'
import SearchInterface from '@/components/SearchInterface'

export default function Home() {
  return (
    <div className="container">
      <div className="search-container">
        <h1>🔍 Szwego & Yupoo Search</h1>
        <SearchInterface />
      </div>
    </div>
  )
}
