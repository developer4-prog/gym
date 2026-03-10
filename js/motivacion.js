const messages = [
  "Hoy es un gran día para volverte más fuerte 💪",
  "No pares cuando estés cansado, para cuando termines 🔥",
  "Cada repetición construye tu mejor versión 💪",
  "Disciplina hoy, orgullo mañana 🔥",
  "Tu único límite eres tú 💪",
  "Entrena duro, vive fuerte 🔥",
  "Hoy duele, mañana te hace más fuerte 💪",
];

const random = Math.floor(Math.random() * messages.length);

document.getElementById("motivationalText").textContent = messages[random];

function goLogin() {
  window.location.href = "login.html";
}
