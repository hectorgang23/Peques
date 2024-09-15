import React, { useState } from "react";
import usuarioImg from "../img/usuario.png";
import { NavLink, useHistory } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "../Styles/Login.css";
import { Button } from "@nextui-org/react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Input } from "@nextui-org/react";
import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonList,
  IonInput,
  IonItem,
  IonContent,
  IonSpinner,
} from "@ionic/react";

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const history = useHistory();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log(user);
      localStorage.setItem("loggedIn", "true");
      onLogin(); // Llamamos a la función onLogin
      history.push("/inicio");
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
      setErrorMessage("Error en las credenciales"); // Mostrar mensaje de error
    } finally {
      setLoading(false);
    }
  };
  //rounded-b-3xl
  /*max-w-sm es el tamaño de ancho máximo más cercano a 400px (es 24rem o 384px).
mt-8 es margin-top de 2rem (equivalente a 32px, un poco más que 30px).
p-5 es padding de 1.25rem (equivalente a 20px).
shadow-lg es la sombra más parecida a box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1). */
  return (
    <IonContent>
      <Card className=" max-w-sm mx-auto  bg-black mt-8 p-5 shadow-lg rounded-3xl text-white">
        <img
          alt="Silueta de montañas"
          src={usuarioImg}
          style={{
            width: "40%",
            borderRadius: "10px",
            marginRight: "105px",
            marginLeft: "auto",
            display: "block",
          }}
        />
        <IonCardHeader
          style={{ textAlign: "center" }}
          className="rounded-b-3xl"
        >
          <IonCardTitle style={{ fontSize: "24px", fontWeight: "bold" }}>
            Iniciar Sesión
          </IonCardTitle>
          <IonCardSubtitle style={{ color: "#666" }}>
            Inicia sesión para entrar al sistema
          </IonCardSubtitle>
        </IonCardHeader>

        <form onSubmit={handleLogin} style={{ marginTop: "20px" }}>
          <IonList className="bg-black">
            <IonInput
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
              required
              placeholder=" Email"
              className="bg-[#212121] border border-transparent focus:border-blue-500 hover:border-blue-500 focus:outline-none text-white font-mono  font-arial rounded-lg px-4 py-2 mt-5"
              />

            <IonInput
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
              required
              placeholder=" Contraseña"
              className="bg-[#212121] border border-transparent focus:border-blue-500 hover:border-blue-500 focus:outline-none text-white font-mono  font-arial rounded-lg px-4 py-2 mt-5"
              />
          </IonList>
          <Button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "20px",
              backgroundColor: "#007bff",
              color: "#fff",
            }}
          >
            {loading ? <IonSpinner name="crescent" /> : "Iniciar sesión"}
          </Button>
        </form>
        {errorMessage && (
          <p style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
            {errorMessage}
          </p>
        )}
      </Card>
    </IonContent>
  );
};

export default Login;
