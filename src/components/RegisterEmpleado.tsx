import React, { useState, FormEvent } from "react";
import Register1Img from "../img/nuevo.svg";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; 
import { Button } from "@nextui-org/react";
import { Card } from "@nextui-org/card";
import {
  IonContent,
  IonList,
  IonInput,
  IonSpinner,
  IonAlert,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
} from "@ionic/react";

const RegistroEmpleado: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [contraseña, setContraseña] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // Crear usuario en Firebase Authentication
      const credencialUsuario = await createUserWithEmailAndPassword(
        auth,
        email,
        contraseña
      );
      const usuario = credencialUsuario.user;

      // Guarda el usuario en Firestore con la propiedad 'empleado'
      await setDoc(doc(db, "usuarios", usuario.uid), {
        email: usuario.email,
        empleado: true,
        creadoEn: new Date(),
      });

      // Mostrar alerta de éxito
      setShowAlert(true);
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonContent className="ion-padding">
  <Card className="max-w-md mx-auto bg-black mt-8 p-6 shadow-lg rounded-3xl text-white">
    <img
      alt="Silueta de montañas"
      src={Register1Img}
      style={{
        width: "40%",
        borderRadius: "10px",
        margin: "0 auto",
        display: "block",
        filter: "invert(1) sepia(1) saturate(10) hue-rotate(180deg)",
      }}
    />

    <IonCardHeader className="text-center rounded-b-3xl mb-4">
      <IonCardTitle className="text-2xl font-bold">Registrar empleado</IonCardTitle>
      <IonCardSubtitle className="text-gray-400">
        Registra a un empleado ingresando su correo y contraseña
      </IonCardSubtitle>
    </IonCardHeader>

    <form onSubmit={onSubmit} className="space-y-4 p-4">
      <IonInput
        type="email"
        value={email}
        onIonChange={(e) => setEmail(e.detail.value!)}
        required
        placeholder="Email"
        className="bg-gray-800 border border-transparent focus:border-blue-500 focus:outline-none text-white rounded-lg px-4 py-3"
        style={{ padding: "0.75rem 1rem" }} // Ajusta el padding interno
      />

      <IonInput
        type="password"
        value={contraseña}
        onIonChange={(e) => setContraseña(e.detail.value!)}
        required
        placeholder="Contraseña"
        className="bg-gray-800 border border-transparent focus:border-blue-500 focus:outline-none text-white rounded-lg px-4 py-3"
        style={{ padding: "0.75rem 1rem" }} // Ajusta el padding interno
      />

      <Button
        type="submit"
        disabled={loading}
        className="w-full mt-4 bg-red-600 text-white hover:bg-red-700"
      >
        {loading ? <IonSpinner name="bubbles" /> : "Registrar empleado"}
      </Button>

      {errorMessage && (
        <p className="text-red-500 text-center mt-4">
          {errorMessage}
        </p>
      )}
    </form>
  </Card>

  <IonAlert
    isOpen={showAlert}
    onDidDismiss={() => setShowAlert(false)}
    header="Registro Exitoso"
    message="¡Te has registrado correctamente!"
    buttons={["OK"]}
  />
</IonContent>


  );
};

export default RegistroEmpleado;
