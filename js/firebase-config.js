const firebaseConfig = {
  apiKey: "AIzaSyCyv9h_o6SttOuZ6Aj-f8wDENZwj46HF0I",
  authDomain: "gimnasio-21899.firebaseapp.com",
  projectId: "gimnasio-21899",
  storageBucket: "gimnasio-21899.firebasestorage.app",
  messagingSenderId: "101694041831",
  appId: "1:101694041831:web:f9d6a90ca7cccea44e3c42",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
