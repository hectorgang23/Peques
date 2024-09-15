import React, { useEffect, useState } from 'react';
import { IonButton } from '@ionic/react';
import { isPlatform } from '@ionic/react';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { getDatabase, ref, get } from 'firebase/database';
import { app } from '../firebase';
import { Button } from '@nextui-org/react';

interface ScannerVenderProps {
  onCodeScanned: (code: string) => void;
}

const ScannerVender: React.FC<ScannerVenderProps> = ({ onCodeScanned }) => {
  const db = getDatabase(app);

  const handleScanButtonClick = async () => {
    // Consulta en la base de datos
    const databaseRef = ref(db, 'codigo/value'); // Ajusta la ruta según la estructura de tu DB
    try {
      const snapshot = await get(databaseRef);
      if (snapshot.exists()) {
        const mockBarcode = snapshot.val();
        onCodeScanned(mockBarcode);
      } else {
        console.log('No hay datos en la referencia especificada.');
      }
    } catch (error) {
      console.error('Error al obtener datos del Realtime Database:', error);
    }
  };

  return (
    <Button
    className="ion-margin-top bg-blue-500 hover:bg-red-700 text-white px-8 py-4 text-lg"
    style={{ width: '80%', marginBottom: '10px' }}
    onClick={handleScanButtonClick}
  >
    Escanear
  </Button>
);
};

export default ScannerVender;
