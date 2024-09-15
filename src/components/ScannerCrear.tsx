import React from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { app } from '../firebase'; // Ajusta la ruta si es necesario
import { Button } from '@nextui-org/react';

interface ScannerCrearProps {
  onCodeScanned: (code: string) => void;
}

const ScannerCrear: React.FC<ScannerCrearProps> = ({ onCodeScanned }) => {
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
      className="ion-margin-top bg-blue-500 hover:bg-blue-700 text-white px-8 py-4 text-lg"
      style={{ width: '20%', marginBottom: '10px' }}
      onClick={handleScanButtonClick}
    >
      scan
    </Button>
  );
};

export default ScannerCrear;
