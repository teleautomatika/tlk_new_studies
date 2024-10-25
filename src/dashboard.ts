import Chart from 'chart.js/auto';

// Initialize dashboard components
document.addEventListener('DOMContentLoaded', () => {
    initializeInvestmentChart();
    loadTransactions();
    initializeNotes();
    initializeAIChat();
});

// Investment Chart
function initializeInvestmentChart() {
    const ctx = document.getElementById('investmentChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Portfolio Growth',
                data: [30000, 32000, 35000, 34000, 37000, 50000],
                borderColor: 'rgba(138, 43, 226, 1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Transaction Management
function loadTransactions() {
    const transactionList = document.getElementById('transactionList');
    if (!transactionList) return;

    // Sample transaction data
    const transactions = [
        { date: '2024-01-15', type: 'deposit', amount: 5000, status: 'completed' },
        { date: '2024-01-14', type: 'investment', amount: 2000, status: 'completed' },
        { date: '2024-01-13', type: 'withdrawal', amount: 1000, status: 'completed' }
    ];

    transactionList.innerHTML = transactions.map(transaction => `
        <div class="transaction-item p-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-lg font-semibold capitalize">${transaction.type}</p>
                    <p class="text-sm text-gray-500">${transaction.date}</p>
                </div>
                <div class="text-right">
                    <p class="text-lg font-bold ${transaction.type === 'deposit' ? 'text-green-500' : 'text-red-500'}">
                        ${transaction.type === 'deposit' ? '+' : '-'}$${transaction.amount.toLocaleString()}
                    </p>
                    <p class="text-sm text-gray-500 capitalize">${transaction.status}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Notes System
function initializeNotes() {
    const notesContainer = document.getElementById('notesContainer');
    if (!notesContainer) return;

    let notes: Note[] = loadNotes();
    renderNotes(notes);
    initializeNoteEditor();
}

interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: Date;
}

function loadNotes(): Note[] {
    const savedNotes = localStorage.getItem('userNotes');
    return savedNotes ? JSON.parse(savedNotes) : [];
}

function renderNotes(notes: Note[]) {
    const notesContainer = document.getElementById('notesContainer');
    if (!notesContainer) return;

    notesContainer.innerHTML = notes.map(note => `
        <div class="note-card p-4 bg-white rounded-lg shadow-md mb-4">
            <h3 class="text-xl font-bold mb-2">${note.title}</h3>
            <p class="text-gray-600 mb-2">${note.content}</p>
            <div class="flex gap-2">
                ${note.tags.map(tag => `
                    <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        ${tag}
                    </span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function initializeNoteEditor() {
    const editor = document.getElementById('noteEditor');
    if (!editor) return;

    editor.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md">
            <input type="text" id="noteTitle" placeholder="Note Title" 
                   class="w-full mb-4 p-2 border rounded-md">
            <textarea id="noteContent" placeholder="Note Content" 
                      class="w-full h-32 mb-4 p-2 border rounded-md"></textarea>
            <input type="text" id="noteTags" placeholder="Tags (comma separated)" 
                   class="w-full mb-4 p-2 border rounded-md">
            <button id="saveNote" 
                    class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                Save Note
            </button>
        </div>
    `;

    document.getElementById('saveNote')?.addEventListener('click', saveNewNote);
}

function saveNewNote() {
    const title = (document.getElementById('noteTitle') as HTMLInputElement)?.value;
    const content = (document.getElementById('noteContent') as HTMLTextAreaElement)?.value;
    const tagsInput = (document.getElementById('noteTags') as HTMLInputElement)?.value;

    if (!title || !content) return;

    const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        tags: tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: new Date()
    };

    const notes = loadNotes();
    notes.unshift(newNote);
    localStorage.setItem('userNotes', JSON.stringify(notes));
    renderNotes(notes);
}

// AI Chat System
function initializeAIChat() {
    const chatContainer = document.getElementById('aiChat');
    if (!chatContainer) return;

    chatContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow-md h-[500px] flex flex-col">
            <div id="chatMessages" class="flex-1 overflow-y-auto p-4"></div>
            <div class="border-t p-4">
                <div class="flex gap-2">
                    <input type="text" id="chatInput" 
                           class="flex-1 p-2 border rounded-md"
                           placeholder="Ask your AI assistant...">
                    <button id="sendMessage" 
                            class="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                        Send
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('sendMessage')?.addEventListener('click', sendChatMessage);
    document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput') as HTMLInputElement;
    const messages = document.getElementById('chatMessages');
    if (!input || !messages) return;

    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Add user message to chat
    messages.innerHTML += `
        <div class="flex justify-end mb-4">
            <div class="bg-purple-100 rounded-lg p-3 max-w-[70%]">
                ${userMessage}
            </div>
        </div>
    `;

    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
        messages.innerHTML += `
            <div class="flex mb-4">
                <div class="bg-gray-100 rounded-lg p-3 max-w-[70%]">
                    I'm processing your request regarding "${userMessage}". How can I assist you further?
                </div>
            </div>
        `;
        messages.scrollTop = messages.scrollHeight;
    }, 1000);
}