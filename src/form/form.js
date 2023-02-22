import "../assets/styles/styles.scss";
import "./form.scss";

const form = document.querySelector("form");
const errorElement = document.querySelector("#errors");
let errors = [];

form.addEventListener("submit", async (event) => {
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
      const response = await fetch("https://restapi.fr/api/article", {
        method: "POST",
        body: json,
        headers: {
          "Content-Type": "application/json",
        },
      });
      const body = await response.json();
      console.log(body);
    } catch (e) {
      console.log("e : ", e);
    }
  }
});

const formIsValid = (article) => {
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
    errors.forEach((e) => {
      errorHTML += `<li>${e}</li>`;
    });
    errorElement.innerHTML = errorHTML;
    return false;
  } else {
    errorElement.innerHTML = ""; // si pas d'erreur ==> empty char chain
    return true;
  }
};
