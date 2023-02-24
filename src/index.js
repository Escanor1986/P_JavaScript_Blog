import "./assets/styles/styles.scss";
import "./index.scss";
// On pouvait également ajouter un chunk(fichier JS) dans le fichier webpack pour récupérer la fonction
// Mais cela aurait dupliqué beaucoup de code
import { openModal } from "./assets/javascripts/modal";

const articleContainerElement = document.querySelector(".articles-container");
const categoriesContainerElement = document.querySelector(".categories");
const selectElement = document.querySelector("select");
let filter;
let articles;
let sortBy = "desc";

// Gestion du changement de valeur dans la select list des catégories
selectElement.addEventListener("change", () => {
  sortBy = selectElement.value;
  fetchArticle(); // une fois fetchArticle modifié, il nous suffit de l'appeler de nouveau !
  console.log(sortBy);
});

// Gestion de la création de l'article et de l'affichage de ceux contenus dans l'API
const createArticles = () => {
  const articlesDOM = articles
    .filter((article) => {
      if (filter) {
        // si filter est défini on retourne la catégorie sélectionnée
        return article.category === filter;
      } else {
        return true; // On retourne l'intégralié des articles dans ce cas car filter n'existe pas
      }
    })
    .map((article) => {
      const articleDOM = document.createElement("div");
      articleDOM.classList.add("article");
      articleDOM.innerHTML = `
<img
  src="${article.img}"
  alt="profile"
/>
<h2>${article.title}</h2>
<p class="article-author">${article.author} - ${new Date(
        article.createdAt
      ).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}</p>
<p class="article-content">
  ${article.content}
</p>
<div class="article-actions">
  <button class="btn btn-danger" data-id=${article._id} >Supprimer</button>
  <button class="btn btn-primary" data-id=${article._id} >Modifier</button>

</div>
`;
      return articleDOM;
    });
  articleContainerElement.innerHTML = "";
  articleContainerElement.append(...articlesDOM);
  const deleteButtons = articleContainerElement.querySelectorAll(".btn-danger");
  const editButtons = articleContainerElement.querySelectorAll(".btn-primary");

  // Gestion de l'édition de l'article pour modification
  editButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const target = event.target;
      const articleId = target.dataset.id;
      window.location.assign(`/form.html?id=${articleId}`);
    });
  });

  // Gestion de la suppression de l'article
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const result = await openModal(
        "Etes vous sûr de vouloir supprimer votre article ?"
      );
      if (result === true) {
        try {
          const target = event.target;
          const articleId = target.dataset.id;
          // On soécifie l'id de l'article à récupérer
          const response = await fetch(
            `https://restapi.fr/api/article/${articleId}`,
            {
              method: "DELETE",
            }
          );
          await response.json();
          fetchArticle();
        } catch (e) {
          console.log("e : ", e);
        }
      }
    });
  });
};

// Gestion de l'affichage des catégories
const displayMenuCategories = (categoriesArr) => {
  const liElements = categoriesArr.map((categoryElem) => {
    const li = document.createElement("li");
    li.innerHTML = `${categoryElem[0]} ( <strong>${categoryElem[1]}</strong> )`;
    if (categoryElem[0] === filter) {
      // Nous permets de garder le tri sur la catégorie sélectionnée
      li.classList.add("active");
    }
    // Ici on va se servir des closures pour écouter l'évènement sur le click des catégories
    li.addEventListener("click", () => {
      if (filter === categoryElem[0]) {
        // Si la catégorie est sélectionnée, on retire la classe active
        filter = null;
        li.classList.remove("active");
        createArticles();
      } else {
        // Si la catégorie n'est pas sélectionnée, on lui donne la classe active
        filter = categoryElem[0];
        liElements.forEach((li) => {
          li.classList.remove("active");
        });
        li.classList.add("active");
        createArticles();
      }
    });
    return li; // ne pas oublier de retourner "li" pour l'affichage
  });

  categoriesContainerElement.innerHTML = "";
  categoriesContainerElement.append(...liElements);
};

// Gestion de la création des catégories
const createMenuCategories = () => {
  const categories = articles.reduce((acc, article) => {
    if (acc[article.category]) {
      // si un article existe déjà dans une catégorie
      acc[article.category]++; // On incrémente
    } else {
      acc[article.category] = 1; // sinon on ajoute un élément au tableau
    }
    return acc;
  }, {});

  const categoriesArr = Object.keys(categories)
    .map((category) => {
      return [category, categories[category]]; // On itère avec map pour récupérer un tableau avec [Category, (nombre d'objet dans la category)]
    })
    .sort((c1, c2) => c1[0].localeCompare(c2[0])); // Ici on utilise la méthode sort avec la fonction localeCompare pur tirer les catégories alphabétiquement
  displayMenuCategories(categoriesArr);
};

// const fetchArticle = async () => {
//   // Ne pas oublier async / await avec fetch (asynchrone)
//   try {
//     // on modifie fetch pour appliquer le tri directement à la récupération des donnés sur l'API
//     const response = await fetch(
//       `https://restapi.fr/api/article?sort=createdAt:${sortBy}`
//     );
//     articles = await response.json(); // Let articles, déclaré au dessus du code, est assigné ici au moment du fetch
//     if (!Array.isArray(articles)) {
//       articles = [articles];
//     }
//     createArticles(); // On appel createArticles pour générer l'affichage des articles sur la page
//     createMenuCategories(); // on appel createMenuCategories pour générer l'affichage du menu par catégorie
//   } catch (e) {
//     console.log("e : ", e);
//   }
// };

// Gestion de l'appel à l'API et de la Side Bar pour les catégories
const fetchArticle = async () => {
  const progressContainer = document.querySelector(".progress-container");
  try {
    progressContainer.style.display = "flex";
    const response = await fetch(
      `https://restapi.fr/api/article?sort=createdAt:${sortBy}`
    );
    articles = await response.json();
    if (!Array.isArray(articles)) {
      articles = [articles];
    }
    createArticles();
    createMenuCategories();
  } catch (e) {
    console.log("e : ", e);
  } finally {
    progressContainer.style.display = "none";
  }
};

fetchArticle();
