// Chat widget state management
let chatIsOpen = false;

// Open chat widget
function openChatWidget() {
    const chatContainer = document.getElementById('chatContainer');
    const chatOverlay = document.getElementById('chatOverlay');
    const floatingBtn = document.getElementById('floatingChatBtn');
    const chatPromptBubble = document.getElementById('chatPromptBubble');
    const chatIframe = document.getElementById('chatIframe');
    
    chatContainer.classList.add('active');
    chatOverlay.classList.add('active');
    floatingBtn.classList.add('hidden');
    
    if (chatPromptBubble) {
        chatPromptBubble.style.display = 'none';
    }
    
    // Load the Flask app URL in the iframe
    if (!chatIframe.src) {
        chatIframe.src = 'https://medical-appointment-app-c699.onrender.com/';
    }
    
    chatIsOpen = true;
    
    // Prevent body scroll on mobile
    if (window.innerWidth <= 768) {
        document.body.style.overflow = 'hidden';
    }
}

// Close chat widget
function closeChatWidget() {
    const chatContainer = document.getElementById('chatContainer');
    const chatOverlay = document.getElementById('chatOverlay');
    const floatingBtn = document.getElementById('floatingChatBtn');
    const chatPromptBubble = document.getElementById('chatPromptBubble');
    
    chatContainer.classList.remove('active');
    chatOverlay.classList.remove('active');
    floatingBtn.classList.remove('hidden');
    
    if (chatPromptBubble) {
        chatPromptBubble.style.display = 'block';
    }
    
    chatIsOpen = false;
    
    // Restore body scroll
    document.body.style.overflow = '';
}

// Handle escape key globally
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && chatIsOpen) {
        closeChatWidget();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Medical ChatBot Widget initialized successfully!');
});
