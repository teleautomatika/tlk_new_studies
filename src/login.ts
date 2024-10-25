document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm') as HTMLFormElement;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const username = formData.get('username');
        const password = formData.get('password');

        if (username && password) {
            try {
                // Add loading state
                const submitButton = loginForm.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.textContent = 'Connecting...';
                    submitButton.setAttribute('disabled', 'true');
                }

                // Simulate authentication delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Redirect to dashboard
                window.location.href = '/src/dashboard.html';
            } catch (error) {
                console.error('Login failed:', error);
                // Reset button state
                const submitButton = loginForm.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.textContent = 'Enter Neural Network';
                    submitButton.removeAttribute('disabled');
                }
            }
        }
    });

    // Social login handlers
    const socialButtons = document.querySelectorAll('button[data-provider]');
    socialButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const provider = (button as HTMLElement).dataset.provider;
            
            // Add loading state
            button.setAttribute('disabled', 'true');
            
            try {
                // Simulate authentication delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.href = '/src/dashboard.html';
            } catch (error) {
                console.error(`${provider} login failed:`, error);
                button.removeAttribute('disabled');
            }
        });
    });
});