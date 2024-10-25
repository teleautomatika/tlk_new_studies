import { v4 as uuidv4 } from 'uuid';

interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    created: Date;
    updated: Date;
}

class NeuralNotes {
    private notes: Note[] = [];
    private editor: HTMLElement | null;
    private notesGrid: HTMLElement | null;

    constructor() {
        this.editor = document.getElementById('note-editor');
        this.notesGrid = document.getElementById('notes-grid');
        this.loadNotes();
        this.initializeEventListeners();
    }

    private initializeEventListeners() {
        // New Note Button
        document.getElementById('new-note')?.addEventListener('click', () => {
            if (this.editor) this.editor.classList.remove('hidden');
        });

        // Close Editor
        document.getElementById('close-editor')?.addEventListener('click', () => {
            if (this.editor) this.editor.classList.add('hidden');
        });

        // Save Note
        document.getElementById('save-note')?.addEventListener('click', () => this.saveNote());

        // Close modal when clicking outside
        this.editor?.addEventListener('click', (e) => {
            if (e.target === this.editor) {
                this.editor.classList.add('hidden');
            }
        });
    }

    private loadNotes() {
        const savedNotes = localStorage.getItem('neural-notes');
        if (savedNotes) {
            this.notes = JSON.parse(savedNotes).map((note: any) => ({
                ...note,
                created: new Date(note.created),
                updated: new Date(note.updated)
            }));
            this.renderNotes();
        }
    }

    private saveNote() {
        const titleInput = document.getElementById('note-title') as HTMLInputElement;
        const contentInput = document.getElementById('note-content') as HTMLTextAreaElement;
        const tagsInput = document.getElementById('note-tags') as HTMLInputElement;

        if (!titleInput.value || !contentInput.value) return;

        const newNote: Note = {
            id: uuidv4(),
            title: titleInput.value,
            content: contentInput.value,
            tags: tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean),
            created: new Date(),
            updated: new Date()
        };

        this.notes.unshift(newNote);
        localStorage.setItem('neural-notes', JSON.stringify(this.notes));
        
        // Clear form
        titleInput.value = '';
        contentInput.value = '';
        tagsInput.value = '';
        
        // Hide editor
        if (this.editor) this.editor.classList.add('hidden');
        
        this.renderNotes();
        this.addNoteWithAnimation(newNote);
    }

    private renderNotes() {
        if (!this.notesGrid) return;

        this.notesGrid.innerHTML = this.notes.map(note => `
            <div class="note-card" data-id="${note.id}">
                <h3 class="note-title">${note.title}</h3>
                <div class="note-content">${this.truncateContent(note.content)}</div>
                <div class="note-tags">
                    ${note.tags.map(tag => `
                        <span class="note-tag">${tag}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // Add click listeners to notes
        document.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', () => this.viewNote(card.getAttribute('data-id')));
        });
    }

    private addNoteWithAnimation(note: Note) {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-card';
        noteElement.style.opacity = '0';
        noteElement.style.transform = 'translateY(20px)';
        noteElement.innerHTML = `
            <h3 class="note-title">${note.title}</h3>
            <div class="note-content">${this.truncateContent(note.content)}</div>
            <div class="note-tags">
                ${note.tags.map(tag => `
                    <span class="note-tag">${tag}</span>
                `).join('')}
            </div>
        `;

        this.notesGrid?.prepend(noteElement);
        
        // Trigger animation
        requestAnimationFrame(() => {
            noteElement.style.transition = 'all 0.3s ease-out';
            noteElement.style.opacity = '1';
            noteElement.style.transform = 'translateY(0)';
        });
    }

    private truncateContent(content: string): string {
        return content.length > 150 ? content.substring(0, 150) + '...' : content;
    }

    private viewNote(noteId: string | null) {
        if (!noteId) return;
        
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;

        // Populate editor with note data
        (document.getElementById('note-title') as HTMLInputElement).value = note.title;
        (document.getElementById('note-content') as HTMLTextAreaElement).value = note.content;
        (document.getElementById('note-tags') as HTMLInputElement).value = note.tags.join(', ');

        // Show editor
        if (this.editor) this.editor.classList.remove('hidden');
    }
}

// Initialize Neural Notes
document.addEventListener('DOMContentLoaded', () => {
    new NeuralNotes();
});