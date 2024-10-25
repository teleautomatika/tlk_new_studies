import { Chart, registerables } from 'chart.js/auto';
import { AISystem, initializeAI } from './services/ai-system';

Chart.register(...registerables);

class NeuralAssistant {
    private aiSystem: AISystem;
    private metricsChart: Chart | null = null;
    private messageInput: HTMLInputElement | null;
    private chatMessages: HTMLDivElement | null;

    constructor() {
        this.aiSystem = initializeAI();
        this.messageInput = document.getElementById('message-input') as HTMLInputElement;
        this.chatMessages = document.getElementById('chat-messages') as HTMLDivElement;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    private initialize() {
        this.initializeUI();
        this.setupMetricsChart();
        this.startSystemMonitoring();
        this.addWelcomeMessage();
    }

    private initializeUI() {
        const sendButton = document.getElementById('send-button');
        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }

        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
    }

    private addWelcomeMessage() {
        const welcome = "Neural Assistant online. How can I help you today?";
        this.addMessage('assistant', welcome);
    }

    private async sendMessage() {
        if (!this.messageInput) return;
        
        const message = this.messageInput.value.trim();
        if (!message) return;

        this.addMessage('user', message);
        this.messageInput.value = '';
        this.messageInput.disabled = true;

        try {
            const response = await this.aiSystem.processQuery(message);
            this.addMessage('assistant', response);
        } catch (error) {
            this.addMessage('assistant', 'Processing error. Please try again.');
        } finally {
            this.messageInput.disabled = false;
            this.messageInput.focus();
        }
    }

    private addMessage(type: 'user' | 'assistant', content: string) {
        if (!this.chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message-bubble ${type}`;
        messageDiv.textContent = content;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTo({
            top: this.chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    private setupMetricsChart() {
        const ctx = document.getElementById('training-metrics') as HTMLCanvasElement;
        if (!ctx) return;

        this.metricsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Accuracy',
                    data: [],
                    borderColor: 'rgba(147, 51, 234, 1)',
                    backgroundColor: 'rgba(147, 51, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }

    private startSystemMonitoring() {
        setInterval(() => {
            const metrics = this.aiSystem.getMetrics();
            this.updateMetrics(metrics);
        }, 2000);
    }

    private updateMetrics(metrics: { accuracy: number; bandwidth: number }) {
        this.updateProgressBars(metrics);
        this.updateMetricsChart(metrics);
    }

    private updateProgressBars(metrics: { accuracy: number; bandwidth: number }) {
        const elements = {
            nodes: document.getElementById('nodes-progress'),
            training: document.getElementById('training-progress'),
            network: document.getElementById('network-progress')
        };

        if (elements.nodes) elements.nodes.style.width = `${metrics.accuracy * 100}%`;
        if (elements.training) elements.training.style.width = `${metrics.accuracy * 100}%`;
        if (elements.network) elements.network.style.width = `${metrics.bandwidth * 100}%`;
    }

    private updateMetricsChart(metrics: { accuracy: number; bandwidth: number }) {
        if (!this.metricsChart) return;

        const timestamp = new Date().toLocaleTimeString();
        
        this.metricsChart.data.labels?.push(timestamp);
        this.metricsChart.data.datasets[0].data.push(metrics.accuracy * 100);

        if (this.metricsChart.data.labels!.length > 10) {
            this.metricsChart.data.labels?.shift();
            this.metricsChart.data.datasets[0].data.shift();
        }

        this.metricsChart.update('none');
    }
}

new NeuralAssistant();