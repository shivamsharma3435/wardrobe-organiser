// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const uploadBtn = document.getElementById('uploadBtn');
const imageUpload = document.getElementById('imageUpload');
const addClothingInput = document.getElementById('addClothingInput');
const navItems = document.querySelectorAll('.sidebar nav ul li');
const mainContentSections = document.querySelectorAll('.main-content > div');
const generateOutfitBtn = document.getElementById('generateOutfit');

// Simulated wardrobe data
let wardrobeItems = []; // Clear all default items

// Gemini API key - To be replaced with your actual API key
const GEMINI_API_KEY = 'Your-Actual-API-Key';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

// Shopping List Data Structure
let shoppingLists = {
    essentials: {
        name: "Wardrobe Essentials",
        items: []
    },
    summer: {
        name: "Summer Vacation",
        items: []
    },
    workwear: {
        name: "Work Capsule",
        items: []
    }
};

let currentListId = 'essentials';
let totalBudget = 500;

// User Profile Functions
function initUserProfile() {
    const profileImage = document.querySelector('.profile-image');
    const uploadBtn = document.querySelector('.upload-btn');
    const profileImageUpload = document.getElementById('profileImageUpload');
    
    // Load saved profile data
    loadUserProfile();

    // Handle image upload
    uploadBtn.addEventListener('click', () => {
        profileImageUpload.click();
    });

    profileImageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Create and display the image in the profile section
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '50%';
                
                // Clear the profile image container and add the new image
                profileImage.innerHTML = '';
                profileImage.appendChild(img);
                
                // Save the image data
                localStorage.setItem('userProfileImage', e.target.result);
                
                // Update sidebar profile image
                updateSidebarProfileImage(e.target.result);
                
                // Show success message
                showNotification('Profile photo updated successfully!', 'success');
                
                // Log for debugging
                console.log('Image loaded and displayed:', e.target.result.substring(0, 50) + '...');
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle form submission
    const saveProfileBtn = document.getElementById('saveProfile');
    const cancelProfileBtn = document.getElementById('cancelProfile');

    saveProfileBtn.addEventListener('click', () => {
        const profileData = {
            fullName: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            bio: document.getElementById('userBio').value,
            stylePreference: document.getElementById('userStyle').value,
            size: document.getElementById('userSize').value
        };

        // Save profile data
        localStorage.setItem('userProfileData', JSON.stringify(profileData));
        
        // Update sidebar profile
        updateSidebarProfile(profileData);
        
        // Show success message
        showNotification('Profile updated successfully!', 'success');
    });

    cancelProfileBtn.addEventListener('click', () => {
        loadUserProfile(); // Reset form to saved data
    });
    
    // Make sidebar profile clickable
    const sidebarProfile = document.querySelector('.user-profile');
    sidebarProfile.style.cursor = 'pointer';
    
    // Remove any existing click event listeners
    const newSidebarProfile = sidebarProfile.cloneNode(true);
    sidebarProfile.parentNode.replaceChild(newSidebarProfile, sidebarProfile);
    
    // Add the click event listener
    newSidebarProfile.addEventListener('click', function() {
        console.log('Profile clicked');
        
        // Hide all other sections
        const chatContainer = document.querySelector('.chat-container');
        const wardrobeView = document.querySelector('.wardrobe-view');
        const outfitGenerator = document.querySelector('.outfit-generator');
        const shoppingList = document.querySelector('.shopping-list');
        
        if (chatContainer) chatContainer.style.display = 'none';
        if (wardrobeView) wardrobeView.style.display = 'none';
        if (outfitGenerator) outfitGenerator.style.display = 'none';
        if (shoppingList) shoppingList.style.display = 'none';
        
        // Show profile section
        const profileSection = document.querySelector('.user-profile-section');
        if (profileSection) {
            profileSection.style.display = 'flex';
            console.log('Profile section displayed');
        } else {
            console.error('Profile section not found');
        }
        
        // Update active state in sidebar
        document.querySelectorAll('.sidebar nav ul li').forEach(item => {
            item.classList.remove('active');
        });
    });
}

function loadUserProfile() {
    // Load profile image
    const savedImage = localStorage.getItem('userProfileImage');
    if (savedImage) {
        const profileImage = document.querySelector('.profile-image');
        const img = document.createElement('img');
        img.src = savedImage;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        
        // Clear the profile image container and add the new image
        profileImage.innerHTML = '';
        profileImage.appendChild(img);
        
        // Also update the sidebar profile image
        updateSidebarProfileImage(savedImage);
    }

    // Load profile data
    const savedData = localStorage.getItem('userProfileData');
    if (savedData) {
        const profileData = JSON.parse(savedData);
        document.getElementById('userName').value = profileData.fullName || '';
        document.getElementById('userEmail').value = profileData.email || '';
        document.getElementById('userBio').value = profileData.bio || '';
        document.getElementById('userStyle').value = profileData.stylePreference || '';
        document.getElementById('userSize').value = profileData.size || '';
    }
}

function updateSidebarProfile(profileData) {
    const sidebarProfileName = document.querySelector('.user-profile h3');
    if (sidebarProfileName) {
        sidebarProfileName.textContent = profileData.fullName || 'User Profile';
    }
}

function updateSidebarProfileImage(imageData) {
    const sidebarProfilePic = document.querySelector('.user-profile .profile-pic');
    if (sidebarProfilePic) {
        sidebarProfilePic.innerHTML = `<img src="${imageData}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    }
}

// Initialize the application
function initApp() {
    setupEventListeners();
    renderWardrobeItems();
    initShoppingList();
    
    // Add event listener for the "Add Suggestions" button
    document.querySelector('.banner-action').addEventListener('click', addSuggestions);
    
    // Initialize user profile
    initUserProfile();
    
    // Make sure the user profile section is properly initialized
    const profileSection = document.querySelector('.user-profile-section');
    if (profileSection) {
        console.log('User profile section found');
    } else {
        console.error('User profile section not found in the DOM');
    }
}

// Set up event listeners
function setupEventListeners() {
    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);
    
    // Send message on Enter key (but allow Shift+Enter for new lines)
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Image upload
    uploadBtn.addEventListener('click', () => {
        imageUpload.click();
    });
    
    imageUpload.addEventListener('change', handleImageUpload);
    
    // Navigation
    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show appropriate section
            mainContentSections.forEach(section => section.style.display = 'none');
            
            if (index === 0) { // Dashboard/Chat
                document.querySelector('.chat-container').style.display = 'flex';
            } else if (index === 1) { // My Wardrobe
                document.querySelector('.wardrobe-view').style.display = 'block';
            } else if (index === 2) { // Outfit Generator
                document.querySelector('.outfit-generator').style.display = 'block';
            } else if (index === 3) { // Shopping List
                document.querySelector('.shopping-list').style.display = 'flex';
            }
        });
    });
    
    // Generate outfit
    generateOutfitBtn.addEventListener('click', generateOutfit);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.textContent.toLowerCase();
            filterWardrobeItems(filter);
        });
    });
}

// Send message function
function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Clear input
    userInput.value = '';
    
    // Process with AI (simulate API call)
    processWithGemini(message);
}

// Add message to chat
function addMessageToChat(sender, content, isImage = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (isImage) {
        const img = document.createElement('img');
        img.src = content;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '8px';
        messageContent.appendChild(img);
    } else {
        messageContent.innerHTML = `<p>${content}</p>`;
    }
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Process message with Gemini API
async function processWithGemini(message) {
    // Show typing indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot';
    loadingDiv.innerHTML = `
        <div class="message-content">
            <p>Thinking...</p>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `As an AI wardrobe assistant, respond to this user query: ${message}
                        
                        Context: The user has a wardrobe with these items: ${JSON.stringify(wardrobeItems)}
                        
                        Respond in a helpful, conversational manner, offering wardrobe organization tips, outfit suggestions, or answering any clothing-related questions.`
                    }]
                }]
            })
        });
        
        const data = await response.json();
        
        if (data.candidates && data.candidates.length > 0) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            chatMessages.removeChild(loadingDiv);
            addMessageToChat('bot', aiResponse);
        } else {
            throw new Error('Invalid API response');
        }
        
    } catch (error) {
        console.error('Error processing with Gemini:', error);
        chatMessages.removeChild(loadingDiv);
        addMessageToChat('bot', "I'm having trouble connecting to the AI service right now. Please try again later.");
    }
}

// Handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Display the image in chat
    const reader = new FileReader();
    reader.onload = function(event) {
        addMessageToChat('user', event.target.result, true);
        
        // Simulate AI processing the image
        setTimeout(() => {
            const responses = [
                "This looks like a blue button-up shirt. Would you like me to add it to your wardrobe?",
                "I see a pair of black pants. Shall I add them to your wardrobe items?",
                "This appears to be a red dress. Would you like me to categorize it and add it to your collection?"
            ];
            
            // Pick a random response
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessageToChat('bot', randomResponse);
        }, 2000);
        
        // In a real app, you would send this image to Gemini for analysis
    };
    reader.readAsDataURL(file);
    
    // Clear the input
    e.target.value = '';
}

// Render wardrobe items
function renderWardrobeItems(filter = 'all') {
    const container = document.querySelector('.wardrobe-items');
    container.innerHTML = '';
    
    // Add "Add New" button
    const addNew = document.createElement('div');
    addNew.className = 'clothing-item add-new';
    addNew.innerHTML = `
        <div class="clothing-img" style="display: flex; justify-content: center; align-items: center;">
            <i class="fas fa-plus" style="font-size: 3rem; color: #ccc;"></i>
        </div>
        <div class="clothing-info">
            <h4>Add New Item</h4>
        </div>
    `;
    addNew.addEventListener('click', () => {
        addClothingInput.click();
    });
    container.appendChild(addNew);
    
    // Filter items
    let filteredItems = wardrobeItems;
    if (filter !== 'all') {
        filteredItems = wardrobeItems.filter(item => item.type === filter.toLowerCase());
    }
    
    // Add items
    filteredItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'clothing-item';
        itemElement.innerHTML = `
            <div class="clothing-img">
                <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
            </div>
            <div class="clothing-info">
                <h4>${item.name}</h4>
                <p>${item.type}, ${item.occasions.join(', ')}</p>
            </div>
        `;
        container.appendChild(itemElement);
    });
}

// Filter wardrobe items
function filterWardrobeItems(filter) {
    renderWardrobeItems(filter);
}

// Generate outfit based on selected criteria
function generateOutfit() {
    const occasion = document.getElementById('occasion').value;
    const weather = document.getElementById('weather').value;
    
    const outfitContainer = document.querySelector('.generated-outfit');
    outfitContainer.innerHTML = ''; // Clear previous outfits
    
    // Simulate AI generating an outfit
    setTimeout(() => {
        // Filter items based on occasion and weather
        const suitableTops = wardrobeItems.filter(item => 
            item.type === 'tops' && 
            item.occasions.includes(occasion)
        );
        
        const suitableBottoms = wardrobeItems.filter(item => 
            item.type === 'bottoms' && 
            item.occasions.includes(occasion)
        );
        
        const suitableShoes = wardrobeItems.filter(item => 
            item.type === 'shoes' && 
            item.occasions.includes(occasion)
        );
        
        // If we have items in each category, create an outfit
        if (suitableTops.length > 0 && suitableBottoms.length > 0 && suitableShoes.length > 0) {
            // Pick random items from each category
            const top = suitableTops[Math.floor(Math.random() * suitableTops.length)];
            const bottom = suitableBottoms[Math.floor(Math.random() * suitableBottoms.length)];
            const shoes = suitableShoes[Math.floor(Math.random() * suitableShoes.length)];
            
            // Create outfit items
            createOutfitItem(outfitContainer, top);
            createOutfitItem(outfitContainer, bottom);
            createOutfitItem(outfitContainer, shoes);
            
            // Add feedback text
            const feedback = document.createElement('div');
            feedback.className = 'outfit-feedback';
            feedback.innerHTML = `
                <h3>Outfit for ${occasion} in ${weather} weather</h3>
                <p>This ${occasion} outfit pairs well and is appropriate for ${weather} weather.</p>
                <button class="save-outfit">Save Outfit</button>
            `;
            outfitContainer.appendChild(feedback);
        } else {
            outfitContainer.innerHTML = '<p>Not enough items in your wardrobe for this combination. Try adding more items or selecting different criteria.</p>';
        }
    }, 1000);
}

// Create outfit item element
function createOutfitItem(container, item) {
    const itemElement = document.createElement('div');
    itemElement.className = 'outfit-item';
    itemElement.innerHTML = `
        <div class="outfit-img" style="background-color: ${item.color};">
            <!-- Placeholder for item image -->
        </div>
        <div class="outfit-label">${item.name}</div>
    `;
    container.appendChild(itemElement);
}

// Add new clothing item
addClothingInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create a URL for the uploaded image
    const imageUrl = URL.createObjectURL(file);
    
    const newId = wardrobeItems.length + 1;
    const newItem = {
        id: newId,
        type: 'tops', // Default type
        name: `New Clothing Item ${newId}`,
        color: getRandomColor(),
        season: 'all',
        occasions: ['casual'],
        image: imageUrl
    };
    
    wardrobeItems.push(newItem);
    renderWardrobeItems();
    
    // Alert the user
    alert('New item added to your wardrobe!');
    
    // Clear the input
    e.target.value = '';
});

// Helper function to generate random colors
function getRandomColor() {
    const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'orange', 'pink'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Shopping List Functions
function initShoppingList() {
    // Set up event listeners for shopping list
    document.getElementById('createNewList').addEventListener('click', createNewList);
    document.getElementById('setBudget').addEventListener('click', setBudget);
    document.getElementById('addItemForm').addEventListener('submit', addShoppingItem);
    
    // Set up list navigation
    document.querySelectorAll('#shoppingListsNav li').forEach(item => {
        item.addEventListener('click', () => switchList(item.dataset.listId));
    });
    
    // Set up view switching
    document.querySelectorAll('.view-option').forEach(button => {
        button.addEventListener('click', () => {
            // Update active state of buttons
            document.querySelectorAll('.view-option').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update container class
            const container = document.getElementById('currentShoppingList');
            container.classList.remove('list-view', 'grid-view');
            container.classList.add(button.dataset.view + '-view');
        });
    });
    
    // Initial render
    renderShoppingList();
}

function createNewList() {
    const listName = prompt('Enter name for new shopping list:');
    if (listName) {
        const listId = listName.toLowerCase().replace(/\s+/g, '-');
        shoppingLists[listId] = {
            name: listName,
            items: []
        };
        
        // Add to navigation
        const nav = document.getElementById('shoppingListsNav');
        const li = document.createElement('li');
        li.dataset.listId = listId;
        li.innerHTML = `
            <span>${listName}</span>
            <span class="item-count">0</span>
        `;
        li.addEventListener('click', () => switchList(listId));
        nav.appendChild(li);
        
        // Switch to new list
        switchList(listId);
    }
}

function setBudget() {
    const newBudget = prompt('Enter your budget amount:', totalBudget);
    if (newBudget && !isNaN(newBudget)) {
        totalBudget = parseFloat(newBudget);
        document.getElementById('budgetAmount').textContent = `$${totalBudget}`;
        updateListStats();
    }
}

function addShoppingItem(e) {
    e.preventDefault();
    
    const item = {
        id: Date.now(),
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        price: parseFloat(document.getElementById('itemPrice').value) || 0,
        priority: document.getElementById('itemPriority').value,
        store: document.getElementById('itemStore').value,
        deadline: document.getElementById('itemDeadline').value,
        notes: document.getElementById('itemNotes').value,
        sustainable: document.getElementById('sustainableOption').checked,
        secondHand: document.getElementById('secondHandOption').checked,
        dateAdded: new Date().toISOString()
    };
    
    shoppingLists[currentListId].items.push(item);
    renderShoppingList();
    e.target.reset();
}

function removeShoppingItem(itemId) {
    shoppingLists[currentListId].items = shoppingLists[currentListId].items.filter(item => item.id !== itemId);
    renderShoppingList();
}

function switchList(listId) {
    currentListId = listId;
    document.querySelectorAll('#shoppingListsNav li').forEach(li => {
        li.classList.toggle('active', li.dataset.listId === listId);
    });
    renderShoppingList();
}

function updateListStats() {
    const currentList = shoppingLists[currentListId];
    const totalItems = currentList.items.length;
    const totalCost = currentList.items.reduce((sum, item) => sum + item.price, 0);
    
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalCost').textContent = `$${totalCost.toFixed(2)}`;
    
    // Update item count in navigation
    document.querySelector(`#shoppingListsNav li[data-list-id="${currentListId}"] .item-count`).textContent = totalItems;
}

function renderShoppingList() {
    const container = document.getElementById('currentShoppingList');
    const currentList = shoppingLists[currentListId];
    
    container.innerHTML = currentList.items.map(item => `
        <div class="shopping-item" data-id="${item.id}">
            <div class="item-info">
                <h4 class="item-name">${item.name}</h4>
                <span class="item-category">${item.category}</span>
                <span class="item-price">$${item.price.toFixed(2)}</span>
                <span class="item-priority ${item.priority}">${item.priority}</span>
            </div>
            <div class="item-details">
                ${item.store ? `<span class="item-store"><i class="fas fa-store"></i> ${item.store}</span>` : ''}
                ${item.deadline ? `<span class="item-deadline"><i class="fas fa-calendar"></i> ${new Date(item.deadline).toLocaleDateString()}</span>` : ''}
                ${item.sustainable ? '<span class="item-sustainable"><i class="fas fa-leaf"></i> Sustainable</span>' : ''}
                ${item.secondHand ? '<span class="item-secondhand"><i class="fas fa-recycle"></i> Second-hand</span>' : ''}
            </div>
            <div class="item-actions">
                <button onclick="removeShoppingItem(${item.id})" class="remove-item"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
    
    updateListStats();
}

// Add Suggestions functionality
function addSuggestions() {
    const suggestions = [
        {
            name: "White Button-Up Shirt",
            category: "tops",
            price: 45.00,
            priority: "high",
            notes: "Essential neutral top for formal occasions",
            sustainable: true
        },
        {
            name: "Black Oxford Shoes",
            category: "shoes",
            price: 89.99,
            priority: "high",
            notes: "Classic formal shoes for work and special events",
            sustainable: false
        },
        {
            name: "Navy Blazer",
            category: "tops",
            price: 120.00,
            priority: "medium",
            notes: "Versatile outer layer for formal and semi-formal occasions",
            sustainable: true
        }
    ];
    
    // Add suggestions to current list
    suggestions.forEach(item => {
        const newItem = {
            id: Date.now() + Math.random(),
            ...item,
            dateAdded: new Date().toISOString()
        };
        shoppingLists[currentListId].items.push(newItem);
    });
    
    // Update the UI
    renderShoppingList();
    
    // Show success message
    const banner = document.querySelector('.gap-analysis-banner');
    banner.innerHTML = `
        <div class="banner-icon"><i class="fas fa-check-circle"></i></div>
        <div class="banner-content">
            <h4>Suggestions Added!</h4>
            <p>Added ${suggestions.length} essential items to your shopping list.</p>
        </div>
    `;
    
    // Remove the banner after 3 seconds
    setTimeout(() => {
        banner.style.display = 'none';
    }, 3000);
}

// Show user profile section
function showUserProfile() {
    console.log('showUserProfile called');
    
    // Hide all other sections
    const chatContainer = document.querySelector('.chat-container');
    const wardrobeView = document.querySelector('.wardrobe-view');
    const outfitGenerator = document.querySelector('.outfit-generator');
    const shoppingList = document.querySelector('.shopping-list');
    
    if (chatContainer) chatContainer.style.display = 'none';
    if (wardrobeView) wardrobeView.style.display = 'none';
    if (outfitGenerator) outfitGenerator.style.display = 'none';
    if (shoppingList) shoppingList.style.display = 'none';
    
    // Show profile section
    const profileSection = document.querySelector('.user-profile-section');
    if (profileSection) {
        profileSection.style.display = 'flex';
        console.log('Profile section displayed');
    } else {
        console.error('Profile section not found');
    }
    
    // Update active state in sidebar
    document.querySelectorAll('.sidebar nav ul li').forEach(item => {
        item.classList.remove('active');
    });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
