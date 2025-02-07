const apiKey = '20664e46e0a7415284feea62e9db69c6';  // Your API Key

// Get references to the DOM elements
const getPairingsButton = document.getElementById('get-pairings');
const userInput = document.getElementById('userInput');
const recipeList = document.querySelector('.recipelist');
const ingredientImage = document.getElementById('ingredientImage');  // Ingredient image element
const ingredientInfo = document.getElementById('ingredientInfo');  // Ingredient information element

// Event listener for the button click
getPairingsButton.addEventListener('click', function() {
    const ingredient = userInput.value.trim();

    if (ingredient) {
        fetchRecipes(ingredient);  // Fetch recipes based on ingredient name
        fetchIngredientInfo(ingredient);  // Fetch ingredient image and info
    } else {
        alert("Please enter an ingredient.");
    }
});

// Function to fetch recipes based on ingredient name
function fetchRecipes(ingredient) {
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredient}&apiKey=${apiKey}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }
            return response.json();
        })
        .then(data => {
            recipeList.innerHTML = '';  // Clear previous recipes

            if (data.length > 0) {
                data.forEach(recipe => {
                    fetchRecipeDetails(recipe.id, recipe.title, recipe.image);  // Fetch each recipe's details
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

// Function to fetch detailed recipe information
function fetchRecipeDetails(recipeId, title, imageUrl) {
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            const img = document.createElement('img');
            const p = document.createElement('p');
            const ingredientsList = document.createElement('ul');  // Ingredient list

            // Recipe title and link
            a.href = `https://spoonacular.com/recipes/${title}-${recipeId}`;
            a.target = '_blank';
            a.textContent = title;

            // Recipe image
            img.src = imageUrl;
            img.alt = title;
            img.style.width = '100px';
            img.style.borderRadius = '5px';
            img.style.marginRight = '10px';

            // Recipe summary (description)
            p.innerHTML = data.summary.split(".")[0] + '.';  // First sentence of the summary

            // Ingredient list
            data.extendedIngredients.forEach(ingredient => {
                const ingredientItem = document.createElement('li');
                ingredientItem.textContent = `${ingredient.amount} ${ingredient.unit} of ${ingredient.name}`;
                ingredientsList.appendChild(ingredientItem);
            });

            // Append the recipe details to the list item
            li.appendChild(img);
            li.appendChild(a);
            li.appendChild(p);
            li.appendChild(ingredientsList);
            recipeList.appendChild(li);
        })
        .catch(error => {
            console.error('Error fetching recipe details:', error);
        });
}

// Function to fetch ingredient image and detailed information (including description)
function fetchIngredientInfo(ingredient) {
    const url = `https://api.spoonacular.com/food/ingredients/autocomplete?query=${ingredient}&apiKey=${apiKey}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch ingredient info');
            }
            return response.json();
        })
        .then(data => {
            ingredientImage.style.display = 'none';  // Hide previous image
            ingredientInfo.innerHTML = '';  // Clear previous ingredient info

            if (data.length > 0) {
                const ingredientData = data.find(item => item.name.toLowerCase() === ingredient.toLowerCase());

                if (ingredientData) {
                    // Fetch the ingredient image
                    if (ingredientData.image) {
                        ingredientImage.src = `https://spoonacular.com/cdn/ingredients_100x100/${ingredientData.image}`;
                        ingredientImage.style.display = 'block';  // Show the image
                    } else {
                        ingredientImage.style.display = 'none';  // Hide image if not found
                    }

                    // Display ingredient description (if available)
                    const ingredientDesc = document.createElement('p');
                    ingredientDesc.textContent = `Description: ${ingredientData.name}`;
                    ingredientInfo.appendChild(ingredientDesc);

                    // Additional information can be added here if available from Spoonacular API
                }
            } else {
                ingredientImage.style.display = 'none';  // Hide image if no match found
                ingredientInfo.innerHTML = '<p>No information available for this ingredient.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching ingredient info:', error);
            ingredientImage.style.display = 'none';  // Hide image on error
            ingredientInfo.innerHTML = '<p>Error fetching ingredient information.</p>';
        });
}

