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
  info.innerHTML = "Selecciona un día para ver el entrenamiento.";

  const dayElements = {};

  function dibujarCalendarioBase() {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    calendar.innerHTML = "";

    for (let i = 0; i < firstDay; i++) {
      const emptyBox = document.createElement("div");
      calendar.appendChild(emptyBox);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayBox = document.createElement("div");
      dayBox.classList.add("day");
      dayBox.textContent = day;

      dayBox.addEventListener("click", () => {
        info.innerHTML = "😴 No registraste entrenamiento";
      });

      calendar.appendChild(dayBox);
      dayElements[day] = dayBox;
    }
  }

  async function cargarWorkouts(user) {
    const workouts = {};

    const snapshot = await firebase
      .firestore()
      .collection("usuarios")
      .doc(user.uid)
      .collection("entrenamientos")
      .get();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const fecha = doc.id; // YYYY-MM-DD

      const [y, m, d] = fecha.split("-").map(Number);
      const date = new Date(y, m - 1, d);

      if (date.getMonth() === month && date.getFullYear() === year) {
        workouts[date.getDate()] = data.ejercicios.join(", ");
      }
    });

    return workouts;
  }

  async function marcarWorkouts(user) {
    try {
      const workouts = await cargarWorkouts(user);

      Object.keys(workouts).forEach((day) => {
        const dayNumber = Number(day);
        const dayBox = dayElements[dayNumber];

        if (dayBox) {
          dayBox.classList.add("workout");

          dayBox.addEventListener("click", () => {
            info.innerHTML = `💪 Entrenaste: <b>${workouts[dayNumber]}</b>`;
          });
        }
      });
    } catch (error) {
      console.error("Error cargando entrenamientos:", error);
      info.innerHTML = "Error al cargar el historial.";
    }
  }

  dibujarCalendarioBase();

  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      alert("No hay usuario logueado");
      window.location.href = "login.html";
      return;
    }

    marcarWorkouts(user);
  });
});
