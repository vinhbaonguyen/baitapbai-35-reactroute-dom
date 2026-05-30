const fs = require('fs');
const path = require('path');
const graphPath = path.join(process.cwd(), '.understand-anything', 'knowledge-graph.json');
const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
const nodes = graph.nodes || [];
const fileNodeIds = nodes.filter(n => n.type === 'file').map(n => ({ id: n.id, filePath: n.filePath }));
const isRouting = n => n.filePath === 'App.jsx' || n.filePath === 'main.jsx' || n.filePath === 'routes/index.jsx' || n.filePath === 'components/ProtectRoute.jsx';
const isPresentation = n => n.filePath === 'App.css' || n.filePath === 'index.css' || n.filePath === 'layouts/LayoutDefault.jsx' || n.filePath.startsWith('pages/') || (n.filePath.startsWith('components/') && n.filePath !== 'components/ProtectRoute.jsx');
const isDataLogic = n => ['actions/', 'reducers/', 'services/', 'constants/', 'hooks/', 'utils/', 'validators/', 'store/'].some(prefix => n.filePath.startsWith(prefix));
const routingIds = fileNodeIds.filter(isRouting).map(n => n.id);
const presentationIds = fileNodeIds.filter(n => isPresentation(n) && !routingIds.includes(n.id)).map(n => n.id);
const dataLogicIds = fileNodeIds.filter(n => isDataLogic(n) && !routingIds.includes(n.id) && !presentationIds.includes(n.id)).map(n => n.id);
const remainingIds = fileNodeIds.map(n => n.id).filter(id => !routingIds.includes(id) && !presentationIds.includes(id) && !dataLogicIds.includes(id));
const fallbackPresentation = remainingIds.filter(id => id.includes('components/') || id.includes('pages/') || id.includes('layouts/') || id === 'App.jsx' || id === 'main.jsx');
const fallbackDataLogic = remainingIds.filter(id => !fallbackPresentation.includes(id));
presentationIds.push(...fallbackPresentation);
dataLogicIds.push(...fallbackDataLogic);
graph.layers = [
  {
    id: 'layer:routing',
    name: 'Routing Layer',
    description: 'Contains application routing setup and route guard components.',
    nodeIds: routingIds
  },
  {
    id: 'layer:presentation',
    name: 'Presentation Layer',
    description: 'Contains page screens, UI components, modals, and picker components.',
    nodeIds: presentationIds
  },
  {
    id: 'layer:data-logic',
    name: 'Data & Logic Layer',
    description: 'Contains data management, configuration and business logic files.',
    nodeIds: dataLogicIds
  }
];
fs.writeFileSync(graphPath, JSON.stringify(graph, null, 2));
console.log('Updated layers:');
console.log(' Routing:', routingIds.length, 'nodes');
console.log(' Presentation:', presentationIds.length, 'nodes');
console.log(' Data & Logic:', dataLogicIds.length, 'nodes');
