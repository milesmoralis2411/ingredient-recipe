// script.js
const apiKey = '20664e46e0a7415284feea62e9db69c6';

// DOM Elements
const getPairingsButton = document.getElementById('get-pairings');
const userInput = document.getElementById('userInput');
const recipeList = document.querySelector('.recipelist');
const favoritesList = document.getElementById('favoritesList');
const ingredientImage = document.getElementById('ingredientImage');
const ingredientInfo = document.getElementById('ingredientInfo');
const suggestionsList = document.getElementById('suggestions');
const darkModeToggle = document.getElementById('darkModeToggle');
const modeText = document.getElementById('modeText');

// Load saved preferences
document.addEventListener("DOMContentLoaded", () => {
    displayFavorites();
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
        modeText.textContent = "🌙 Dark Mode";
    }
});

// Dark Mode Toggle
darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = darkModeToggle.checked;
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    modeText.textContent = isDark ? "🌙 Dark Mode" : "🌞 Light Mode";
});

// Search Recipes
getPairingsButton.addEventListener('click', () => {
    const ingredient = userInput.value.trim();
    if (ingredient) {
        fetchRecipes(ingredient);
        fetchIngredientImage(ingredient);
        recipeList.innerHTML = '<li class="loading">Loading recipes...</li>';
    } else {
        ingredientInfo.innerHTML = '<p class="error">Please enter an ingredient!</p>';
    }
});

// Autocomplete Suggestions
userInput.addEventListener('input', debounce(() => {
    const query = userInput.value.trim();
    if (query.length < 2) return;

    fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?query=${query}&number=5&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            suggestionsList.innerHTML = "";
            data.forEach(item => {
                const option = document.createElement("option");
                option.value = item.name;
                suggestionsList.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching suggestions:', error));
}, 300));

// Fetch Recipes
function fetchRecipes(ingredient) {
    fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredient}&number=10&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            recipeList.innerHTML = '';
            if (data.length > 0) {
                data.forEach(recipe => fetchRecipeDetails(recipe.id));
            } else {
                recipeList.innerHTML = '<li>No recipes found. Try another ingredient!</li>';
            }
        })
        .catch(error => {
            console.error('Error fetching recipes:', error);
            recipeList.innerHTML = '<li>Failed to load recipes. Please try again.</li>';
        });
}

// Fetch Recipe Details
function fetchRecipeDetails(recipeId) {
    fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=true&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const li = createRecipeCard(data);
            recipeList.appendChild(li);
        })
        .catch(error => console.error('Error fetching recipe details:', error));
}

// Create Recipe Card
function createRecipeCard(data) {
    const li = document.createElement('li');
    li.classList.add('recipe-card');
    li.innerHTML = `
        <div class="recipe-image">
            <img src="${data.image || 'placeholder.jpg'}" alt="${data.title}" loading="lazy">
        </div>
        <div class="recipe-content">
            <h3><a href="${data.sourceUrl}" target="_blank">${data.title}</a></h3>
            <p>${data.summary.split('.')[0] + '.'}</p>
            <div class="ingredients">
                <h4>Ingredients:</h4>
                <ul>${data.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}</ul>
            </div>
        </div>
    `;
    
    const favButton = document.createElement('button');
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isFavorited = favorites.some(recipe => recipe.id === data.id);
    favButton.innerHTML = isFavorited ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    favButton.classList.add('fav-btn');
    favButton.setAttribute('data-id', data.id);
    favButton.addEventListener('click', () => toggleFavorite(data.id, data.title, data.image, favButton));
    li.appendChild(favButton);
    
    return li;
}

// Fetch Ingredient Image
function fetchIngredientImage(ingredient) {
    fetch(`https://api.spoonacular.com/food/ingredients/search?query=${ingredient}&number=1&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.results && data.results.length > 0) {
                const imageUrl = `https://spoonacular.com/cdn/ingredients_250x250/${data.results[0].image}`;
                ingredientImage.src = imageUrl;
                ingredientImage.style.display = 'block';
                ingredientInfo.innerHTML = `<p>Showing recipes with ${ingredient}</p>`;
            } else {
                ingredientImage.style.display = 'none';
                ingredientInfo.innerHTML = `<p>No image found for ${ingredient}</p>`;
            }
        })
        .catch(error => {
            console.error('Error fetching ingredient image:', error);
            ingredientImage.style.display = 'none';
            ingredientInfo.innerHTML = '<p>Failed to load ingredient information</p>';
        });
}

// Toggle Favorite (for adding only)
function toggleFavorite(id, title, image, button) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isFavorited = favorites.some(recipe => recipe.id === id);
    
    if (!isFavorited) {
        favorites.push({ id, title, image });
        button.innerHTML = '<i class="fas fa-star"></i>';
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }
}

// Remove Favorite
function removeFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(recipe => recipe.id !== id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
    
    // Update the recipe list button if it exists
    const recipeButton = recipeList.querySelector(`.fav-btn[data-id="${id}"]`);
    if (recipeButton) {
        recipeButton.innerHTML = '<i class="far fa-star"></i>';
    }
}

// Display Favorites
function displayFavorites() {
    favoritesList.innerHTML = "";
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    favorites.forEach(recipe => {
        const li = document.createElement('li');
        li.classList.add('favorite-card');
        li.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" loading="lazy">
            <a href="https://spoonacular.com/recipes/${recipe.title}-${recipe.id}" target="_blank">${recipe.title}</a>
            <button class="remove-btn"><i class="fas fa-trash"></i></button>
        `;
        li.querySelector('.remove-btn').addEventListener('click', () => removeFavorite(recipe.id));
        favoritesList.appendChild(li);
    });
}

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
