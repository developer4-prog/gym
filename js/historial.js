// historial.js
document.addEventListener("DOMContentLoaded", () => {
  const calendar = document.getElementById("calendar");
  const info = document.getElementById("workout-info");
  const monthTitle = document.getElementById("month-title");

  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  monthTitle.textContent = `${monthNames[month]} ${year}`;

  // Espera a que el usuario esté logueado
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      alert("No hay usuario logueado");
      window.location.href = "login.html"; // redirige si no hay login
      return;
    }

    // Función para cargar entrenamientos
    async function cargarWorkouts() {
      const workouts = {}; // día -> ejercicios

      const snapshot = await firebase
        .firestore()
        .collection("usuarios")
        .doc(user.uid)
        .collection("entrenamientos")
        .get();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const fecha = doc.id; // "YYYY-MM-DD"
        const date = new Date(fecha);
        if (date.getMonth() === month && date.getFullYear() === year) {
          workouts[date.getDate()] = data.ejercicios.join(", ");
        }
      });

      return workouts;
    }

    // Función para dibujar calendario
    async function dibujarCalendario() {
      const workouts = await cargarWorkouts();

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay();

      calendar.innerHTML = "";
      info.innerHTML = "";

      for (let i = 0; i < firstDay; i++)
        calendar.appendChild(document.createElement("div"));

      for (let day = 1; day <= daysInMonth; day++) {
        const dayBox = document.createElement("div");
        dayBox.classList.add("day");
        dayBox.textContent = day;

        if (workouts[day]) dayBox.classList.add("workout");

        dayBox.addEventListener("click", () => {
          if (workouts[day]) {
            info.innerHTML = `💪 Entrenaste: <b>${workouts[day]}</b>`;
          } else {
            info.innerHTML = "😴 No registraste entrenamiento";
          }
        });

        calendar.appendChild(dayBox);
      }
    }

    dibujarCalendario(); // dibuja el calendario al cargar
  });
});
