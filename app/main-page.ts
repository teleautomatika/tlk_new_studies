import { NavigatedData, Page } from '@nativescript/core';
import { MainViewModel } from './main-view-model';

export function navigatingTo(args: NavigatedData) {
    const page = <Page>args.object;
    if (!page.bindingContext) {
        page.bindingContext = new MainViewModel();
    }
    initializeStars(page);
}

function initializeStars(page: Page) {
    const container = page.getViewById('starsContainer');
    if (container) {
        // Clear existing stars
        container.removeChildren();
        
        // Add new stars
        for (let i = 0; i < 50; i++) {
            const star = new Label();
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            container.addChild(star);
        }
    }
}