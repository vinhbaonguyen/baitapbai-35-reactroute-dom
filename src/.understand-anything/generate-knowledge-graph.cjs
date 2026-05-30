#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const repoRoot = process.cwd()
const graphPath = path.join(repoRoot, '.understand-anything', 'knowledge-graph.json')
if(!fs.existsSync(graphPath)){
  console.error('knowledge-graph.json not found at', graphPath)
  process.exit(2)
}

const graph = JSON.parse(fs.readFileSync(graphPath,'utf8'))
const nodes = Array.isArray(graph.nodes) ? graph.nodes : []
const edges = Array.isArray(graph.edges) ? graph.edges : []

const nodeById = new Map(nodes.filter(Boolean).map(n=>[n.id, n]))

function findMatchingId(v){
  if(!v) return null
  if(nodeById.has(v)) return v
  const noPrefix = v.replace(/^file:/,'')
  if(nodeById.has('file:'+noPrefix)) return 'file:'+noPrefix
  if(nodeById.has(noPrefix)) return noPrefix
  return null
}

edges.forEach(e=>{
  const src = e.from || e.source || null
  const dst = e.to || e.target || null
  const srcMatch = findMatchingId(src)
  const dstMatch = findMatchingId(dst)
  if(srcMatch) e.from = srcMatch
  else if(src) e.from = src
  if(dstMatch) e.to = dstMatch
  else if(dst) e.to = dst
  // keep source/target for compatibility, but ensure from/to exist
})

// Ensure nodes have id; if missing but filePath present, synthesize
nodes.forEach(n=>{
  if(n && !n.id && n.filePath) n.id = 'file:'+n.filePath
})

graph.nodes = nodes
graph.edges = edges
graph.project = graph.project || {}
graph.project.analyzedAt = (new Date()).toISOString()

fs.writeFileSync(graphPath, JSON.stringify(graph, null, 2), 'utf8')
console.log('Normalized knowledge-graph.json — nodes:', nodes.length, 'edges:', edges.length)
