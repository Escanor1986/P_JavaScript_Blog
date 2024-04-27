import "../assets/styles/styles.scss";
import "./form.scss";
import { openModal } from "../assets/javascripts/modal";

const form = document.querySelector("form");
const errorElement = document.querySelector("#errors");
const btnCancel = document.querySelector(".btn-secondary");
let errors = [];
let articleId;

// Nous allons créer une fonction asynchrone que nous invoquons de suite.
// Nous parsons l’URL de la page et vérifions si nous avons un paramètre id.
// Si nous avons un id, nous récupérons l’article correspondant.
const initForm = async () => {
  const params = new URL(window.location.href);
  articleId = params.searchParams.get("id");
  if (articleId) {
    const response = await fetch(`https://restapi.fr/api/article/${articleId}`);
    if (response.status < 300) {
      // Ne retourne donc pas d'erreur dans la requête
      const article = await response.json();
      fillForm(article); // on invoque fillForm pour remplir les champs du formulaire
    }
  }
};

initForm();

// Nous remplissons tous les champs de notre formulaire en créant des références
// et en utilisant les informations récupérées du serveur.
const fillForm = article => {
  const author = document.querySelector('input[name="author"]');
  const img = document.querySelector('input[name="img"]');
  const category = document.querySelector('input[name="category"]');
  const title = document.querySelector('input[name="title"]');
  const content = document.querySelector("textarea");
  author.value = article.author || "";
  img.value = article.img || "";
  category.value = article.category || "";
  title.value = article.title || "";
  content.value = article.content || "";
};

// On écoute l'évènement sur le bouton cancel
btnCancel.addEventListener("click", async () => {
  const result = await openModal(
    // Même chose que dans index.js, on appel la fonction depuis modal.js
    "Si vous quittez la page, vous allez perdre votre article"
  );
  if (result) {
    window.location.assign("/index.html");
  }
});

// Lorsque nous éditons, nous ne créons pas de nouvelle ressource sur le serveur.
// Nous n’utilisons donc pas une requête POST mais une requête PATCH.
// Pas PUT car nous ne remplaçons pas la ressource distante (nous gardons
// la date de création et l’id).

form.addEventListener("submit", async event => {
  event.preventDefault();
  const formData = new FormData(form);

  //   const entries = formData.entries();
  //   const obj = Array.from(entries).reduce((acc, value) => {
  //     acc[value[0]] = value[1];
  //     return acc;
  //   }, {});

  const article = Object.fromEntries(formData.entries()); // entries est itérable "comme" un tableau (cfr console iterator)

  if (formIsValid(article)) {
    try {
      const json = JSON.stringify(article);
      let response;
      // cas de figure si nous sommes en mode édition d'article
      if (articleId) {
        response = await fetch(`https://restapi.fr/api/article/${articleId}`, {
          method: "PATCH",
          body: json,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        // Cas de figure si nous sommes en mode création d'article
        const response = await fetch("https://restapi.fr/api/article", {
          method: "POST",
          body: json,
          headers: {
            "Content-Type": "application/json",
          },
        });
        const body = await response.json();
        console.log(body);
        // Donc en gros, si l'on a bien une requête validée
        if (response.status < 299) {
          // à noter ici qu'avec ".assign", si on ne lui passe pas une url complète avec https...
          // il va ajouter la portion en paramètre à l'url existante pour pouvoir rediriger
          window.location.assign("./index.html");
        }
      }
    } catch (e) {
      console.log("e : ", e);
    }
  }
});

// Fonction pour la validation du formulaire + gestion d'erreurs
const formIsValid = article => {
  // Pour ne pas avoir plusieurs fois l'affichage du message d'erreur, nous réinitialisons un tableau vide à chaque clic !
  errors = [];
  if (
    !article.author ||
    !article.category ||
    !article.content ||
    !article.img ||
    !article.title
  ) {
    errors.push("Veuillez renseigner tous les champs");
  } else {
    errors = [];
  }
  if (errors.length) {
    let errorHTML = "";
    errors.forEach(e => {
      errorHTML += `<li>${e}</li>`;
    });
    errorElement.innerHTML = errorHTML;
    return false;
  } else {
    errorElement.innerHTML = ""; // si pas d'erreur ==> empty char chain
    return true;
  }
};
