// workout.js
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".muscle-btn");
  const saveBtn = document.querySelector(".btn-save");
  if (!saveBtn) return; // evita errores si no existe
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
      console.log(selectedMuscles);
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
      console.log("Guardado:", selectedMuscles);

      // Limpiar selección después de guardar
      buttons.forEach((btn) => btn.classList.remove("active"));
      selectedMuscles = [];
    } catch (error) {
      console.error("Error guardando entrenamiento:", error);
      alert("Error guardando entrenamiento: " + error.message);
    }
  });
});
