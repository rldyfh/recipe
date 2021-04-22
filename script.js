const mealsEl = document.getElementById("meals");
const fav_container = document.querySelector(".fav-meals");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

const mealPopup = document.getElementById("meal-popup");
const popupCloseBtn = document.getElementById("close-popup");
const mealInfoEl = document.querySelector(".meal-info");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const respData = await resp.json();

  const randomMeal = respData.meals[0];

  console.log(randomMeal);

  addMeal(randomMeal, true);
}

async function getMealById(id) {
  const resp = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );

  const respData = await resp.json();

  const meal = respData.meals[0];
  return meal;
}

async function getMealsBySearch(term) {
  const resp = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`
  );

  const respData = await resp.json();
  const meals = respData.meals;

  return meals;
}

function addMeal(mealData, random = false) {
  const meal = document.createElement("div");
  meal.classList.add("meal");
  meal.innerHTML = `
    <div class="meal-header">
        ${random ? '<span class="random">Random Recipe</span>' : ""}
        <img src="${mealData.strMealThumb}" alt="oops!">
        </div>
        <div class="meal-body">
        <h4>${mealData.strMeal}</h4>
        <button class="fav-btn"><i class="fas fa-heart"></i></button>
        </div>
        `;

  const favBtn = meal.querySelector(".fav-btn");
  favBtn.addEventListener("click", () => {
    // toggle?
    if (favBtn.classList.contains("active")) {
      removeMealFromLS(mealData.idMeal);
      favBtn.classList.remove("active");
    } else {
      addMealToLS(mealData.idMeal);
      favBtn.classList.add("active");
    }

    fav_container.innerHTML = "";
    fetchFavMeals();
  });

  meal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  mealsEl.appendChild(meal);
}

function addMealToLS(mealId) {
  const mealIds = getMealsFromLS();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLS(mealId) {
  const mealIds = getMealsFromLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function getMealsFromLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds == null ? [] : mealIds; // i dont know why this syntex used
  // 24:27~
}

async function fetchFavMeals() {
  fav_container.innerHTML = "";

  const mealIds = getMealsFromLS();

  for (let i = 0; i < mealIds.length; i++) {
    const meal = await getMealById(mealIds[i]);
    addFavMeal(meal);
  }
}

function addFavMeal(mealData) {
  const favMeal = document.createElement("li");
  favMeal.innerHTML = `
        <img src=${mealData.strMealThumb} alt="oop!">
        <span>${mealData.strMeal}</span>
        <button class="deleteBtn"><i class="fas fa-times-circle"></i></button>
    `;

  const deleteBtn = favMeal.querySelector(".deleteBtn");

  deleteBtn.addEventListener("click", () => {
    removeMealFromLS(mealData.idMeal);
    fetchFavMeals();
  });

  favMeal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  fav_container.appendChild(favMeal);
}

searchBtn.addEventListener("click", async () => {
  mealsEl.innerHTML = "";

  const search = searchTerm.value; // 42:47~

  const meals = await getMealsBySearch(search);

  console.log(meals);

  meals.forEach((meal) => addMeal(meal));
});

// const mealPopup
popupCloseBtn.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});

function showMealInfo(mealData) {
  mealInfoEl.innerHTML = "";
  const mealEl = document.createElement("div");

  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    if (mealData[`strIngredient${i}`]) {
      ingredients.push(`${mealData["strIngredient" + i]} / 
            ${mealData["strMeasure" + i]}`);
    } else {
      break;
    }
  }

  mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
            <img src="${mealData.strMealThumb}" alt="">
            <div>
                <p>
                    ${mealData.strInstructions}
                </p>
                <h3>Ingredients</h3>
                <ul>
                    ${ingredients
                      .map(
                        (ing) => `
                    <li>${ing}</li>`
                      )
                      .join("")}
                </ul>
            `;

  mealInfoEl.appendChild(mealEl);

  mealPopup.classList.remove("hidden");
}
