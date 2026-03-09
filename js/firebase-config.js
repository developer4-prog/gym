const firebaseConfig = {
  apiKey: "AIzaSyCyv9h_o6SttOuZ6Aj-f8wDENZwj46HF0I",
  authDomain: "gimnasio-21899.firebaseapp.com",
  projectId: "gimnasio-21899",
  storageBucket: "gimnasio-21899.firebasestorage.app",
  messagingSenderId: "101694041831",
  appId: "1:101694041831:web:f9d6a90ca7cccea44e3c42",
};
firebase.initializeApp(firebaseConfig);

// 2️⃣ Referencias a Auth y Firestore
const auth = firebase.auth();
const db = firebase.firestore();

// 3️⃣ Función de login
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // Login con Firebase Auth
    const userCredential = await auth.signInWithEmailAndPassword(
      email,
      password,
    );
    const user = userCredential.user;
    console.log("Usuario autenticado:", user.uid);

    // Obtener rol desde Firestore
    const userDoc = await db.collection("usuarios").doc(user.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log("Datos del usuario:", userData);

      // Redirigir según rol
      if (userData.rol === "admin") {
        window.location.href = "admin.html";
      } else if (userData.rol === "entrenador") {
        window.location.href = "trainer.html";
      } else {
        window.location.href = "dashboard.html";
      }
    } else {
      alert("No se encontró el rol del usuario.");
    }
  } catch (error) {
    console.error("Error en login:", error.message);
    alert("Error: " + error.message);
  }
}

// 4️⃣ Conectar botón de login
document.getElementById("btnLogin").addEventListener("click", login);
