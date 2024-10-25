class DagobaGraph<T> {
    edges: T[];
    vertices: T[];
    vertexIndex: unknown;
    autoid: number;
    constructor(V: T[] = [], E: T[] = []) {
        this.edges = []; // fresh copies so they're not shared
        this.vertices = [];
        this.vertexIndex = {}; // a lookup optimization
        this.autoid = 1; // an auto-incrementing ID counter

        if (Array.isArray(V)) this.addVertices(V); // arrays only, because you wouldn't
        if (Array.isArray(E)) this.addEdges(E); //   call this with singular V and E
    }

    // Add methods previously defined on Dagoba.G prototype here
    addVertices(V: T[]) {
        // Method logic to add vertices
        V.forEach(this.addVertex.bind(this));
    }

    addEdges(E: T[]) {
        // Method logic to add edges
        E.forEach(this.addEdge.bind(this));
    }

    addVertex(vertex: T) {
        if (!vertex._id) {
            vertex._id = this.autoid++;
        } else if (this.findVertexById(vertex._id)) {
            return DagobaGraph.error("A vertex with that ID already exists");
        }

        this.vertices.push(vertex);
        this.vertexIndex[vertex._id] = vertex;
        vertex._out = [];
        vertex._in = [];
    }

    addEdge(edge: T) {
        edge._in = this.findVertexById(edge._in);
        edge._out = this.findVertexById(edge._out);

        if (!(edge._in && edge._out)) {
            return DagobaGraph.error(
                `That edge's ${edge._in ? "out" : "in"} vertex wasn't found.`
            );
        }

        edge._out._out.push(edge);
        edge._in._in.push(edge);

        this.edges.push(edge);
    }

    // Add any other methods you need that were originally on Dagoba.G

    static error(msg: string) {
        console.log(msg);
        return false;
    }
}
