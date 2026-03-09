// Solo una vez: auth y db
const auth = firebase.auth();
const db = firebase.firestore();

// Función de login (una sola vez)
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(
      email,
      password,
    );
    const user = userCredential.user;
    console.log("Usuario autenticado:", user.uid);

    const userDoc = await db.collection("usuarios").doc(user.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log("Datos del usuario:", userData);

      if (userData.rol === "admin") {
        window.location.href = "admin.html";
      } else if (userData.rol === "entrenador") {
        window.location.href = "trainer.html";
      } else {
        window.location.href = "user.html";
      }
    } else {
      alert("No se encontró el rol del usuario.");
    }
  } catch (error) {
    console.error("Error en login:", error.message);
    alert("Error: " + error.message);
  }
}

// Conectar botón de login (una sola vez)
document.getElementById("btnLogin").addEventListener("click", login);
