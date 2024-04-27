const body = document.querySelector("body");
let calc;
let modal;
let cancel;
let confirm;

// Gestion de la création du calc
const createCalc = () => {
  calc = document.createElement("div");
  calc.classList.add("calc");
  calc.addEventListener("click", () => {
    calc.remove();
  });
};

// Gestion de la création de la modal
const createModal = question => {
  modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
    <p>${question}</p>
    `;
  cancel = document.createElement("button"); // Déclaration sans 'let' ou 'const'
  cancel.innerText = "Annuler";
  cancel.classList.add("btn", "btn-secondary");
  confirm = document.createElement("button"); // Déclaration sans 'let' ou 'const'
  confirm.classList.add("btn", "btn-primary");
  confirm.innerText = "Confirmer";

  // Nous empêchons la propagation de l’événement pour
  // que la modale ne se ferme pas lorsque l’on clique dessus :
  modal.addEventListener("click", event => {
    event.stopPropagation();
  });
  modal.append(cancel, confirm);
};

// Gestion de la modal(pop-up) généré lors du click sur un bouton
export function openModal(question) {
  createCalc();
  createModal(question);
  calc.append(modal); // On append la modal au calc
  body.append(calc); // On append le calc au body

  // Nous retournons une nouvelle promesse qui sera tenue
  // lorsque l’utilisateur cliquera.
  return new Promise((resolve, reject) => {
    // Soit il clique sur le calque ou annuler et la promesse sera résolue avec false.
    calc.addEventListener("click", () => {
      resolve(false);
      calc.remove();
    });

    // Soit il clique sur le calque ou annuler et la promesse sera résolue avec false.
    cancel.addEventListener("click", () => {
      resolve(false);
      calc.remove();
    });

    // Soit il clique sur confirmer et la promesse sera résolue avec true.
    confirm.addEventListener("click", () => {
      resolve(true);
      calc.remove();
    });
  });
}
