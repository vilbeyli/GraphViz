let simulation;
let graph;

function loadGraph(name) {
    d3.json(`data/${name}.json`).then(data => {
        graph = data;
        updateGraph();
    });
}

function updateGraph() {
    const svg = d3.select("#graph-container")
        .html("")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    const g = svg.append("g");

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    simulation = d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink(graph.links).id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(svg.node().clientWidth / 2, svg.node().clientHeight / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY());

    const link = g.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link");

    const node = g.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("circle")
        .attr("r", 5)
        .style("fill", d => color(d.group));

    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(d => d.id);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom);

    simulation.alpha(1).restart();
}

function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

document.getElementById("graph-selector").addEventListener("change", (event) => {
    loadGraph(event.target.value);
});

// Initial load
loadGraph("backend_technologies");