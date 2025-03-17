const apiKey = '20664e46e0a7415284feea62e9db69c6';  // Your API Key

// Get references to DOM elements
const getPairingsButton = document.getElementById('get-pairings');
const userInput = document.getElementById('userInput');
const recipeList = document.querySelector('.recipelist');
const favoritesList = document.getElementById('favoritesList');  // Favorites List
const ingredientImage = document.getElementById('ingredientImage');
const ingredientInfo = document.getElementById('ingredientInfo');
const suggestionsList = document.getElementById('suggestions'); // Auto-suggestions list

// Event listener for the button click
getPairingsButton.addEventListener('click', function() {
    const ingredient = userInput.value.trim();

    if (ingredient) {
        fetchRecipes(ingredient);
        fetchIngredientInfo(ingredient);
    } else {
        alert("Please enter an ingredient.");
    }
});

// Function to fetch recipes
function fetchRecipes(ingredient) {
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredient}&apiKey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            recipeList.innerHTML = '';  

            if (data.length > 0) {
                data.forEach(recipe => {
                    fetchRecipeDetails(recipe.id, recipe.title, recipe.image);
                });
            } else {
                recipeList.innerHTML = '<li>No recipes found for this ingredient.</li>';
            }
        })
        .catch(error => {
            console.error('Error fetching recipes:', error);
            recipeList.innerHTML = '<li>Error fetching recipes.</li>';
        });
}

// Fetch detailed recipe information
function fetchRecipeDetails(recipeId, title, imageUrl) {
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            const img = document.createElement('img');
            const p = document.createElement('p');
            const ingredientsList = document.createElement('ul');
            const favButton = document.createElement('button');  // Favorite Button

            a.href = `https://spoonacular.com/recipes/${title}-${recipeId}`;
            a.target = '_blank';
            a.textContent = title;

            img.src = imageUrl;
            img.alt = title;
            img.style.width = '100px';
            img.style.borderRadius = '5px';
            img.style.marginRight = '10px';

            p.innerHTML = data.summary.split(".")[0] + '.';

            data.extendedIngredients.forEach(ingredient => {
                const ingredientItem = document.createElement('li');
                ingredientItem.textContent = `${ingredient.amount} ${ingredient.unit} of ${ingredient.name}`;
                ingredientsList.appendChild(ingredientItem);
            });

            // Favorite button
            favButton.textContent = "⭐ Add to Favorites";
            favButton.classList.add('fav-btn');
            favButton.addEventListener('click', () => addToFavorites(recipeId, title, imageUrl));

            li.appendChild(img);
            li.appendChild(a);
            li.appendChild(p);
            li.appendChild(ingredientsList);
            li.appendChild(favButton);
            recipeList.appendChild(li);
        })
        .catch(error => {
            console.error('Error fetching recipe details:', error);
        });
}

// Function to fetch ingredient auto-suggestions
userInput.addEventListener('input', () => {
    const query = userInput.value.trim();
    if (query.length < 2) return;  // Fetch only if 2+ characters

    fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?query=${query}&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            suggestionsList.innerHTML = ""; // Clear old suggestions

            data.forEach(item => {
                let option = document.createElement("option");
                option.value = item.name;
                suggestionsList.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching suggestions:', error));
});

// Function to add a recipe to favorites
function addToFavorites(recipeId, title, imageUrl) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (!favorites.some(recipe => recipe.id === recipeId)) {
        favorites.push({ id: recipeId, title, imageUrl });
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }
}

// Function to display favorites
function displayFavorites() {
    favoritesList.innerHTML = "";
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    favorites.forEach(recipe => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        const img = document.createElement('img');
        const removeBtn = document.createElement('button');

        a.href = `https://spoonacular.com/recipes/${recipe.title}-${recipe.id}`;
        a.target = '_blank';
        a.textContent = recipe.title;

        img.src = recipe.imageUrl;
        img.style.width = '100px';

        removeBtn.textContent = "❌ Remove";
        removeBtn.classList.add('remove-btn');
        removeBtn.addEventListener('click', () => removeFavorite(recipe.id));

        li.appendChild(img);
        li.appendChild(a);
        li.appendChild(removeBtn);
        favoritesList.appendChild(li);
    });
}

// Function to remove a recipe from favorites
function removeFavorite(recipeId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(recipe => recipe.id !== recipeId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

// Display favorites on page load
document.addEventListener("DOMContentLoaded", displayFavorites);
// Get references
const darkModeToggle = document.getElementById('darkModeToggle');
const modeText = document.getElementById('modeText');

// Check stored preference
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
    modeText.textContent = "🌙 Dark Mode";
}

// Toggle Dark Mode
darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
        modeText.textContent = "🌙 Dark Mode";
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
        modeText.textContent = "🌞 Light Mode";
    }
});


