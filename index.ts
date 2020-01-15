import { parse, printNode, ControlFlowGraph, DataflowAnalyzer, Block, walk } from '@msrvida/python-program-analysis';
var fs = require('fs');

let inputPath = process.argv[2];
const code = fs.readFileSync(inputPath, 'utf8');

const tree = parse(code);

const cfg = new ControlFlowGraph(tree);

console.log(walk(tree).map(node => node.type))

for (let block of cfg.blocks) {
    for (let stmt of block.statements) {
        console.log(printNode(stmt));
    }
}


var edges = [];
var nodes = [];

function getNode(name: String) {
    let idx = nodes.indexOf(name);
    if (idx == -1) {
        idx = nodes.length;
        nodes.push(name);
        return idx;
    }
    return idx;
}

function freshNode(name: String) {
    let idx = nodes.length;
    nodes.push(name);
    return idx;
}

const analyzer = new DataflowAnalyzer();
const results = analyzer.analyze(cfg);
const flows = results.dataflows;
for (let flow of flows.items) {
    if (flow.fromNode.type == "import") {
        continue;
    }
    if (flow.fromNode.type == "call" && flow.toNode.type == "call") {
        let fromfunc = printNode(flow.fromNode.func);
        let tofunc = printNode(flow.toNode.func);
        edges.push([getNode(fromfunc), getNode(tofunc)]);
    }
}

fs.writeFileSync(inputPath + ".py2graph.json",
                 JSON.stringify({nodes: nodes, edges: edges}));