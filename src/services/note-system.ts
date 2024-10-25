import ForceGraph from 'force-graph';
import { marked } from 'marked';

interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    links: string[];
    created: Date;
    modified: Date;
}

class NoteSystem {
    private notes: Map<string, Note> = new Map();
    private graph: any;

    constructor() {
        this.initializeGraph();
    }

    private initializeGraph() {
        const container = document.getElementById('note-graph');
        if (!container) return;

        this.graph = ForceGraph()(container)
            .nodeId('id')
            .nodeLabel('title')
            .linkSource('source')
            .linkTarget('target')
            .nodeColor(() => '#8a2be2')
            .linkColor(() => '#4a148c')
            .onNodeClick(this.handleNodeClick.bind(this));
    }

    createNote(title: string, content: string, tags: string[] = []) {
        const note: Note = {
            id: crypto.randomUUID(),
            title,
            content,
            tags,
            links: this.extractLinks(content),
            created: new Date(),
            modified: new Date()
        };

        this.notes.set(note.id, note);
        this.updateGraph();
        return note;
    }

    private extractLinks(content: string): string[] {
        const linkRegex = /\[\[(.*?)\]\]/g;
        const matches = [...content.matchAll(linkRegex)];
        return matches.map(match => match[1]);
    }

    private updateGraph() {
        const nodes = Array.from(this.notes.values()).map(note => ({
            id: note.id,
            title: note.title
        }));

        const links = Array.from(this.notes.values()).flatMap(note =>
            note.links.map(target => ({
                source: note.id,
                target: this.findNoteIdByTitle(target)
            })).filter(link => link.target)
        );

        this.graph.graphData({ nodes, links });
    }

    private findNoteIdByTitle(title: string): string | null {
        for (const [id, note] of this.notes) {
            if (note.title.toLowerCase() === title.toLowerCase()) {
                return id;
            }
        }
        return null;
    }

    private handleNodeClick(node: any) {
        const note = this.notes.get(node.id);
        if (!note) return;

        const viewer = document.getElementById('note-viewer');
        if (!viewer) return;

        viewer.innerHTML = `
            <h2>${note.title}</h2>
            <div class="tags">
                ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="content">
                ${marked(note.content)}
            </div>
        `;
    }
}

export const noteSystem = new NoteSystem();