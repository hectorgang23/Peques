import React, { useState } from 'react';
import { IonButton, IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel } from '@ionic/react';
import { doc, updateDoc, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import ConfirmModal from './ConfirmModal';

interface RepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  repair: Repair | null;
  updateRepairStatus: (repairId: string, newStatus: string) => Promise<void>;
}

interface Repair {
  id: string;
  title: string;
  description: string;
  date: string;
  brand: string;
  model: string;
  deviceType: string;
  repairType: string;
  status: string;
  customerName?: string;
  contactNumber?: string;
  technician?: string;
  deliveryDate?: {
    seconds: number;
    nanoseconds: number;
  };
  fechaRegistro?: {
    seconds: number;
    nanoseconds: number;
  };
  finalCost?: number;
  folio?: string;
  importe?: number;
  totalCost?: number;
}

const RepairModal: React.FC<RepairModalProps> = ({ isOpen, onClose, repair, updateRepairStatus }) => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async () => {
    if (!repair) return;
    setIsUpdating(true);
    setError(null);
    try {
      await updateRepairStatus(repair.id, 'Entregado');
      // Preparar y registrar la venta
      const saleData = {
        cantidad: 1,
        codigo: repair.folio || repair.id, // Usar folio si está disponible, de lo contrario, usar id de reparación
        precio: repair.finalCost || 0,
        producto: `Reparación: ${repair.brand} ${repair.model}`, // Generar nombre del producto
        timestamp: Timestamp.now(),
        total: repair.totalCost || 0,
      };
      await setDoc(doc(db, 'ventas', repair.id), saleData);
    } catch (error) {
      setError('Error al cambiar el estado de la reparacion.');
      console.error('Error al cambiar el estado de la reparacion:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmClose = (confirm: boolean) => {
    setShowConfirmModal(false);
    if (confirm) {
      handleStatusChange();
    }
  };

  const formatTimestamp = (timestamp?: { seconds: number; nanoseconds: number }) => {
    if (!timestamp) return null;
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('es-MX', {
      timeZone: 'America/Mexico_City',
    });
  };

  if (!repair) return null;

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Detalles de reparación</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem>
              <IonLabel>Estado de la reparacion:</IonLabel>
              <IonLabel color={repair.status === 'Pendiente' ? 'primary' : 'success'}>
                {repair.status}
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Descripción:</IonLabel>
              <IonLabel>{repair.description}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Marca:</IonLabel>
              <IonLabel>{repair.brand}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Modelo:</IonLabel>
              <IonLabel>{repair.model}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Tipo de dispositivo:</IonLabel>
              <IonLabel>{repair.deviceType}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Reparación:</IonLabel>
              <IonLabel>{repair.repairType}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Cliente:</IonLabel>
              <IonLabel>{repair.customerName}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Telefono:</IonLabel>
              <IonLabel>{repair.contactNumber}</IonLabel>
            </IonItem>
            {repair.deliveryDate && (
              <IonItem>
                <IonLabel color="success">Fecha de entrega: {formatTimestamp(repair.deliveryDate)}</IonLabel>
              </IonItem>
            )}
            {repair.fechaRegistro && (
              <IonItem>
                <IonLabel>Fecha de registro: {formatTimestamp(repair.fechaRegistro)}</IonLabel>
              </IonItem>
            )}
            <IonItem>
              <IonLabel>Total restante:</IonLabel>
              <IonLabel>${repair.finalCost}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Folio:</IonLabel>
              <IonLabel>{repair.folio}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Anticipo:</IonLabel>
              <IonLabel>${repair.importe}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Precio total:</IonLabel>
              <IonLabel>${repair.totalCost}</IonLabel>
            </IonItem>
          </IonList>
          {error && <IonLabel color="danger">{error}</IonLabel>}
          <IonButton
            expand="full"
            onClick={() => setShowConfirmModal(true)}
            disabled={isUpdating || repair.status === 'Entregado'}
          >
            {isUpdating ? 'Actualizando...' : 'Cambiar estado a entregado'}
          </IonButton>
          
          <IonButton expand="full" onClick={onClose}>
            Cerrar
          </IonButton>
        </IonContent>
      </IonModal>
      {showConfirmModal && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={handleConfirmClose}
          amount={repair.totalCost || 0} // Pasar el total a liquidar al modal de confirmación
        />
      )}
    </>
  );
};

export default RepairModal;
