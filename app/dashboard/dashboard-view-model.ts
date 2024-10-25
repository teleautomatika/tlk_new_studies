import { Observable } from '@nativescript/core';

export class DashboardViewModel extends Observable {
    private _accountBalance: string = '$50,000.00';
    private _recentTransactions: Array<any> = [];
    private _aiRecommendation: string = '';
    private _chartUrl: string = 'https://quickchart.io/chart?c={type:"line",data:{labels:["Jan","Feb","Mar"],datasets:[{label:"Portfolio Growth",data:[10000,12000,15000]}]}}';

    constructor() {
        super();
        this.loadTransactions();
        this.generateAIInsights();
    }

    get accountBalance(): string {
        return this._accountBalance;
    }

    get recentTransactions(): Array<any> {
        return this._recentTransactions;
    }

    get aiRecommendation(): string {
        return this._aiRecommendation;
    }

    get chartUrl(): string {
        return this._chartUrl;
    }

    private loadTransactions() {
        this._recentTransactions = [
            { description: 'AI-Managed Investment', amount: 500, date: '2024-01-15' },
            { description: 'Smart Savings Interest', amount: 125.50, date: '2024-01-14' },
            { description: 'Auto-Investment', amount: -1000, date: '2024-01-13' }
        ];
        this.notifyPropertyChange('recentTransactions', this._recentTransactions);
    }

    private generateAIInsights() {
        this._aiRecommendation = 'Based on market analysis, consider increasing allocation to tech sector ETFs. Current market conditions show favorable growth potential.';
        this.notifyPropertyChange('aiRecommendation', this._aiRecommendation);
    }

    onTransfer() {
        // Implement transfer logic
    }

    onInvest() {
        // Implement investment logic
    }

    onAIChat() {
        // Navigate to AI chat interface
    }
}