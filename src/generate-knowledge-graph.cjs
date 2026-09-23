const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const projectRoot = process.cwd();
function findUp(start, filename) {
  let dir = path.resolve(start);
  while (true) {
    const candidate = path.join(dir, filename);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}
const jsconfigPath = findUp(projectRoot, 'jsconfig.json');
const packagePath = findUp(projectRoot, 'package.json');
function parseJsonWithComments(text) {
  return JSON.parse(text.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, ''));
}
const jsconfig = jsconfigPath ? parseJsonWithComments(fs.readFileSync(jsconfigPath, 'utf8')) : {};
const packageJson = packagePath ? parseJsonWithComments(fs.readFileSync(packagePath, 'utf8')) : {};
const configRoot = jsconfigPath ? path.dirname(jsconfigPath) : projectRoot;
const baseUrl = jsconfig.compilerOptions?.baseUrl ? path.resolve(configRoot, jsconfig.compilerOptions.baseUrl) : configRoot;
const pathMap = jsconfig.compilerOptions?.paths || {};
const aliasEntries = Object.entries(pathMap).map(([key, values]) => {
  const wildcard = key.endsWith('/*');
  const prefix = wildcard ? key.slice(0, -2) : key;
  const target = values[0];
  const targetPrefix = target.endsWith('/*') ? target.slice(0, -2) : target;
  return { key: prefix, wildcard, targetPrefix };
});
const exts = ['.js', '.jsx', '.ts', '.tsx'];
const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'build') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile()) {
      if (exts.includes(path.extname(entry.name))) sourceFiles.push(full);
    }
  }
}
walk(projectRoot);
const rel = p => path.relative(projectRoot, p).replace(/\\/g, '/');
const existing = new Set(sourceFiles.map(f => rel(f)));
function resolveFileImport(spec, importerPath) {
  if (!spec) return null;
  if (!spec.startsWith('.') && !spec.startsWith('/') && !spec.startsWith('@/') && !aliasEntries.some(a => spec.startsWith(a.key))) {
    return null;
  }
  const tryPath = p => {
    const candidates = [];
    if (fs.existsSync(p) && fs.statSync(p).isFile()) candidates.push(p);
    for (const ext of exts) {
      if (fs.existsSync(p + ext) && fs.statSync(p + ext).isFile()) candidates.push(p + ext);
    }
    for (const ext of exts) {
      const idx = path.join(p, 'index' + ext);
      if (fs.existsSync(idx) && fs.statSync(idx).isFile()) candidates.push(idx);
    }
    return candidates[0] || null;
  };
  if (spec.startsWith('./') || spec.startsWith('../') || spec.startsWith('/')) {
    const base = path.dirname(importerPath);
    const target = path.resolve(base, spec);
    return tryPath(target);
  }
  for (const alias of aliasEntries) {
    if (alias.wildcard) {
      if (spec.startsWith(alias.key)) {
        const suffix = spec.slice(alias.key.length);
        const target = path.resolve(baseUrl, alias.targetPrefix + suffix);
        const resolved = tryPath(target);
        if (resolved) return resolved;
      }
    } else if (spec === alias.key) {
      const target = path.resolve(baseUrl, alias.targetPrefix);
      const resolved = tryPath(target);
      if (resolved) return resolved;
    }
  }
  return null;
}
const importRegex = /(?:import\s+(?:[^'";]+\s+from\s+)?|export\s+(?:[^'";]+\s+from\s+)?|require\(\s*)(['"])([^'"\)]+)\1/g;
const nodes = sourceFiles.map(file => ({
  id: `file:${rel(file)}`,
  type: 'file',
  name: path.basename(file),
  filePath: rel(file),
  summary: `React source file ${rel(file)}`,
  tags: ['source', 'code', 'javascript'],
  complexity: 'moderate'
}));
const edges = [];
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = importRegex.exec(content))) {
    const spec = match[2];
    const resolved = resolveFileImport(spec, file);
    if (resolved) {
      const sourceId = `file:${rel(file)}`;
      const targetId = `file:${rel(resolved)}`;
      if (existing.has(rel(resolved))) {
        edges.push({ source: sourceId, target: targetId, type: 'imports', direction: 'forward', weight: 0.7 });
      }
    }
  }
}
const layerPatterns = [
  {id:'layer:application-shell', name:'Application shell', description:'Entry point, routing and layout files.', patterns:['main.jsx','App.jsx','routes','layouts']},
  {id:'layer:pages', name:'Pages', description:'Route page components and views.', patterns:['pages']},
  {id:'layer:components', name:'UI components', description:'Reusable components and form controls.', patterns:['components']},
  {id:'layer:domain-state', name:'Domain & state', description:'Redux actions/reducers, services, hooks, utilities, and constants.', patterns:['actions','reducers','services','store','hooks','utils','constants','validators']}
];
const layers = layerPatterns.map(layer => ({
  id: layer.id,
  name: layer.name,
  description: layer.description,
  nodeIds: nodes.filter(n => layer.patterns.some(pat => n.filePath === pat || n.filePath.startsWith(pat + '/'))).map(n => n.id)
})).filter(layer => layer.nodeIds.length);
const tour = [
  { order: 1, title: 'Project bootstrap', description: 'Inspect the application entry point and router.', nodeIds:['file:main.jsx','file:App.jsx','file:routes/index.jsx'].filter(id => nodes.some(n => n.id === id)) },
  { order: 2, title: 'Route pages', description: 'Review the main page components connected to routes.', nodeIds:['file:pages/Home/Home.jsx','file:pages/Student/Student.jsx','file:pages/Users/User.jsx','file:pages/SignIn/SignIn.jsx'].filter(id => nodes.some(n => n.id === id)) },
  { order: 3, title: 'Shared form and picker components', description: 'Explore shared form controls and picker modal components.', nodeIds:['file:components/PageComponent/PageHeader.jsx','file:components/PageComponent/DataTable.jsx','file:components/CommonPickers/StudentListPickerModal.jsx'].filter(id => nodes.some(n => n.id === id)) }
].filter(step => step.nodeIds.length);
const graph = {
  version:'1.0.0',
  project:{
    name: packageJson.name || path.basename(projectRoot),
    languages:['javascript','jsx'],
    frameworks:['React','Vite'],
    description:'React Router DOM source tree analysis.',
    analyzedAt:new Date().toISOString(),
    gitCommitHash:'unknown'
  },
  nodes,
  edges,
  layers,
  tour
};
if (fs.existsSync(path.join(projectRoot, '.git'))) {
  try { graph.project.gitCommitHash = execSync('git rev-parse HEAD', { cwd: projectRoot, encoding: 'utf8' }).trim(); } catch {}
}
const outDir = path.join(projectRoot, '.understand-anything');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'knowledge-graph.json'), JSON.stringify(graph, null, 2));
const ignorePath = path.join(outDir, '.understandignore');
if (!fs.existsSync(ignorePath)) {
  fs.writeFileSync(ignorePath, '# .understandignore generated by analysis script\nnode_modules/\n.git/\ndist/\nbuild/\n*.lock\n');
}
console.log('Generated knowledge graph with', nodes.length, 'nodes and', edges.length, 'edges.');
