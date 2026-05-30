#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const graphPath = path.join(process.cwd(), '.understand-anything', 'knowledge-graph.validated.json')
if(!fs.existsSync(graphPath)){
  console.error('validated graph not found:', graphPath)
  process.exit(2)
}

const graph = JSON.parse(fs.readFileSync(graphPath,'utf8'))
const nodes = Array.isArray(graph.nodes) ? graph.nodes : []

const routing = []
const presentation = []
const dataLogic = []

nodes.forEach(n => {
  const id = (n.id||'').toLowerCase()
  // Routing layer
  if (id.includes('app.jsx') || id.includes('main.jsx') || id.includes('/routes/') || id.includes('protectroute')){
    routing.push(n.id)
    return
  }
  // Presentation: pages, layouts, components (UI), modals, pickers
  if (id.includes('/pages/') || id.includes('/layouts/') || (id.includes('/components/') && !id.includes('/components/store') && !id.includes('/components/services')) || id.includes('modal') || id.includes('picker')){
    presentation.push(n.id)
    return
  }
  // Data & Logic: actions, reducers, services, hooks, utils, constants, validators, store
  if (id.includes('/actions/') || id.includes('/reducers/') || id.includes('/services/') || id.includes('/hooks/') || id.includes('/utils/') || id.includes('/constants/') || id.includes('/validators/') || id.includes('/store/') || id.includes('/selectors/') ){
    dataLogic.push(n.id)
    return
  }
  // Fallback: if not matched, classify as presentation if looks like UI, else dataLogic
  if (id.includes('/page') || id.includes('layout') || id.includes('component') ) presentation.push(n.id)
  else dataLogic.push(n.id)
})

// Ensure total coverage
const total = new Set([...routing, ...presentation, ...dataLogic])
if(total.size !== nodes.length){
  // assign any missing
  nodes.forEach(n=>{ if(!total.has(n.id)) dataLogic.push(n.id) })
}

graph.layers = [
  { id: 'layer:routing', name: 'Routing Layer', description: 'App entry and routing', nodeIds: routing },
  { id: 'layer:presentation', name: 'Presentation Layer', description: 'Pages, layouts, components, modals, pickers', nodeIds: presentation },
  { id: 'layer:data-logic', name: 'Data & Logic Layer', description: 'Actions, reducers, services, hooks, utils, constants, validators', nodeIds: dataLogic }
]

fs.writeFileSync(graphPath, JSON.stringify(graph, null, 2), 'utf8')
console.log('Wrote layers to', graphPath)
console.log('Counts:', routing.length, presentation.length, dataLogic.length)
