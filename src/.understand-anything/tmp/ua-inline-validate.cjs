#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function usage(){
  console.error('Usage: node ua-inline-validate.cjs <graph.json> <out/review.json>')
  process.exit(2)
}

const [,, inPath, outPath] = process.argv
if(!inPath || !outPath) usage()

function readJson(p){
  try{
    return JSON.parse(fs.readFileSync(p,'utf8'))
  }catch(e){
    console.error('Failed to read/parse', p, e.message)
    process.exit(3)
  }
}

const graph = readJson(inPath)
const nodes = Array.isArray(graph.nodes) ? graph.nodes : []
const edges = Array.isArray(graph.edges) ? graph.edges : []

const nodeById = new Map(nodes.map(n=>[n.id,n]))
const issues = []

edges.forEach((e, i) => {
  // Accept either `from`/`to` (preferred) or `source`/`target` (alias)
  const from = e.from || e.source
  const to = e.to || e.target
  if(!from || !to) {
    issues.push({type:'edge-missing-end', index:i, edge:e})
    return
  }
  if(!nodeById.has(from)) issues.push({type:'missing-node', role:'from', edgeIndex:i, id:from})
  if(!nodeById.has(to)) issues.push({type:'missing-node', role:'to', edgeIndex:i, id:to})
})

// Node-level checks
const seen = new Set()
const dupIds = []
nodes.forEach((n,i)=>{
  if(!n || typeof n !== 'object') { issues.push({type:'invalid-node', index:i, node:n}); return }
  if(!n.id) issues.push({type:'node-missing-id', index:i, node:n})
  else {
    if(seen.has(n.id)) dupIds.push(n.id)
    seen.add(n.id)
  }
  if(!n.type) issues.push({type:'node-missing-type', id: n.id || null})
})
dupIds.forEach(id=>issues.push({type:'duplicate-node-id', id}))

// Orphan nodes (no edges in or out)
const referenced = new Set()
edges.forEach(e=>{
  const from = e.from || e.source
  const to = e.to || e.target
  if(from) referenced.add(from)
  if(to) referenced.add(to)
})
const orphans = nodes.filter(n=> n && n.id && !referenced.has(n.id))
if(orphans.length) issues.push({type:'orphan-nodes', count: orphans.length, ids: orphans.slice(0,50).map(n=>n.id)})

const report = {
  generatedAt: (new Date()).toISOString(),
  input: path.relative(process.cwd(), inPath),
  output: path.relative(process.cwd(), outPath),
  nodeCount: nodes.length,
  edgeCount: edges.length,
  issueCount: issues.length,
  issues,
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8')
console.log('Validation complete — wrote', outPath)
console.log('Nodes:', nodes.length, 'Edges:', edges.length, 'Issues:', issues.length)
