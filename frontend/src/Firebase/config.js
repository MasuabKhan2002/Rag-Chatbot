import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "API_KEY",
    authDomain: "DOMAIN",
    projectId: "ID",
    storageBucket: "STORAGE",
    messagingSenderId: "SENDER",
    appId: "APPID",
    measurementId: "MEASUREMENTID"
};
  
const app = initializeApp(firebaseConfig);

export default app;