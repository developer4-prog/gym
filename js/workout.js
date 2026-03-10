// workout.js

// --- 1️⃣ HEADER DINÁMICO: NOMBRE DEL USUARIO ---
firebase.auth().onAuthStateChanged(async (user) => {
  const headerH2 = document.querySelector(".header h2");
  if (!headerH2) return; // si no hay header en la página, salimos

  if (user) {
    try {
      const userDoc = await firebase
        .firestore()
        .collection("usuarios")
        .doc(user.uid)
        .get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const nombres = userData.nombres || "Atleta";
        headerH2.textContent = `Hola, ${nombres} 💪`;
      }
    } catch (error) {
      console.error("Error obteniendo nombre del usuario:", error);
      headerH2.textContent = "Hola, Atleta 💪";
    }
  } else {
    // Si no hay usuario logueado, dejamos texto por defecto
    headerH2.textContent = "Hola, Atleta 💪";
  }
});

// --- 2️⃣ SELECCIÓN DE MÚSCULOS Y GUARDADO ---
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".muscle-btn");
  const saveBtn = document.querySelector(".btn-save");
  if (!saveBtn) return; // evita errores si no hay botón
  let selectedMuscles = [];

  // Selección de músculos
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("active");
      const muscle = button.textContent;
      if (selectedMuscles.includes(muscle)) {
        selectedMuscles = selectedMuscles.filter((m) => m !== muscle);
      } else {
        selectedMuscles.push(muscle);
      }
      console.log("Músculos seleccionados:", selectedMuscles);
    });
  });

  // Guardar entrenamiento
  saveBtn.addEventListener("click", async () => {
    const user = firebase.auth().currentUser;
    if (!user) return alert("No hay usuario logueado");
    if (selectedMuscles.length === 0)
      return alert("Selecciona al menos un músculo");

    const hoy = new Date();
    const fecha = hoy.toISOString().split("T")[0];

    const entrenamientoRef = firebase
      .firestore()
      .collection("usuarios")
      .doc(user.uid)
      .collection("entrenamientos")
      .doc(fecha);

    try {
      await entrenamientoRef.set({
        ejercicios: selectedMuscles,
        completado: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });

      alert("Entrenamiento guardado para hoy: " + fecha);
      console.log("Guardado en Firebase:", selectedMuscles);

      // Limpiar selección
      buttons.forEach((btn) => btn.classList.remove("active"));
      selectedMuscles = [];
    } catch (error) {
      console.error("Error guardando entrenamiento:", error);
      alert("Error guardando entrenamiento: " + error.message);
    }
  });
});
