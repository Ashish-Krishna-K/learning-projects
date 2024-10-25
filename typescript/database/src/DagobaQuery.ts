export default class DagobaQuery {
    graph: unknown;
    state: unknown[];
    program: unknown[];
    gremlins: unknown[];
    constructor(graph: unknown) {
        this.graph = graph;
        this.state = [];
        this.program = [];
        this.gremlins = [];
    }

    add(pipetype: unknown, args: unknown) {
        const step = [pipetype, args];
        this.program.push(step);
    }

    v() {
        const query = new DagobaQuery(this);
        query.add("vertex", [].slice.call(arguments));
        return query;
    }
}
