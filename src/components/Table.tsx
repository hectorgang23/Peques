import React, { useState, useEffect } from "react";
import {
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonModal,
} from "@ionic/react";
import UserCreation from "../components/NewProduct/UserCreation";
import DeleteButton from "./Botones/DeleteButton";
import UpdateUser from "../components/NewProduct/UpdateUser";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { pencil, eye, downloadOutline, barcode } from "ionicons/icons";
import { Button } from "@nextui-org/react";
import Search from "./Search";

interface InventarioItem {
  id: string;
  nombre: string;
  codigo: string;
  cantidad: string;
  precio: string;
  imagenURL: string;
  barcodeURL: string; // URL de la imagen del código de barras
}

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const generatePDF = (data: InventarioItem[]) => {
  // Configuración para página tamaño carta en horizontal
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' }) as jsPDFWithAutoTable;

  // Título del documento
  const title = "Reporte de inventario";
  const fontSize = 18;
  doc.setFontSize(fontSize);
  const pageWidth = doc.internal.pageSize.width;
  const titleWidth = doc.getStringUnitWidth(title) * fontSize / doc.internal.scaleFactor;
  const titleX = (pageWidth - titleWidth) / 2;
  doc.text(title, titleX, 20);

  // Configuración de la tabla
  doc.autoTable({
    startY: 30,
    head: [['ID', 'Nombre', 'Código', 'Cantidad', 'Precio']],
    body: data.map(item => [
      item.id,
      item.nombre,
      item.codigo,
      item.cantidad,
      item.precio
    ]),
    styles: {
      fontSize: 10,
      lineColor: 0,
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: [255, 255, 255],
      lineWidth: 0.5,
    },
    margin: { top: 30 },
  });

  // Obtener la fecha de hoy y formatearla
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Enero es 0
  const year = today.getFullYear();
  const formattedDate = `${day}${month}${year}`;

  // Guardar el PDF con la fecha en el nombre
  doc.save(`inventarioMLP${formattedDate}.pdf`);
};


const Table: React.FC = () => {
  const [estadoFrom, setEstadoFrom] = useState<boolean>(false);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<InventarioItem | null>(null);
  const [tableLoaded, setTableLoaded] = useState<boolean>(false);
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [showProductImageModal, setShowProductImageModal] = useState<{ open: boolean; imageURL: string | null }>({ open: false, imageURL: null });
  const [showBarcodeImageModal, setShowBarcodeImageModal] = useState<{ open: boolean; barcodeURL: string | null }>({ open: false, barcodeURL: null });

  const fetchData = async () => {
    const querySnapshot = await getDocs(collection(db, 'inventario'));
    const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as InventarioItem[];
    setInventario(data);
    setTableLoaded(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportToPDF = () => {
    if (!tableLoaded) {
      console.error("Error: Table not loaded yet");
      return;
    }
    generatePDF(inventario);
  };

  const handleDownloadImage = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "imagen.png";
    link.click();
  };

  return (
    <IonContent>
      <div className="container mt-4 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="flex flex-row space-x-2">
            <Button
              color="primary"
              className="hover:-translate-y-1 hover:scale-110 hover:bg-black-100"
              onClick={() => setEstadoFrom(!estadoFrom)}
            >
              Agregar nuevo producto
            </Button>
            <Button
              className="hover:-translate-y-1 hover:scale-110 hover:bg-white-1000"
              onClick={handleExportToPDF}
            >
              Exportar a PDF
            </Button>
          </div>
        </div>
        <Search setSearchResults={setInventario} setInventario={setInventario} />

        <div className="overflow-x-auto">
          <IonList id="table-to-export" className="min-w-full divide-y divide-gray-200">
            <IonItem className="bg-gray-100 flex flex-col md:flex-row">
              <IonLabel className="w-full md:w-1/6 text-center font-medium p-2">Código del Producto</IonLabel>
              <IonLabel className="w-full md:w-1/6 text-center font-medium p-2">Nombre Del Producto</IonLabel>
              <IonLabel className="w-full md:w-1/6 text-center font-medium p-2">Cantidad</IonLabel>
              <IonLabel className="w-full md:w-1/6 text-center font-medium p-2">Precio</IonLabel>
              <IonLabel className="w-full md:w-1/6 text-center font-medium p-2">Acciones</IonLabel>
            </IonItem>

            {inventario.map(item => (
              <IonItem key={item.codigo} className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                <IonLabel className="w-full md:w-1/6 text-center p-2">{item.codigo}</IonLabel>
                <IonLabel className="w-full md:w-1/6 text-center p-2">{item.nombre}</IonLabel>
                <IonLabel className="w-full md:w-1/6 text-center p-2">{item.cantidad}</IonLabel>
                <IonLabel className="w-full md:w-1/6 text-center p-2">{item.precio}</IonLabel>
                <div className="w-full md:w-1/6 flex justify-center md:justify-end items-center space-x-2 p-2">
                  <IonButton fill="clear" className="p-0 m-0" onClick={() => { setSelectedItem(item); setOpenForm(true); }}>
                    <IonIcon icon={pencil} className="icon-edit" />
                  </IonButton>
                  <IonButton
                    fill="clear"
                    className="p-0 m-0"
                    onClick={() => setShowProductImageModal({ open: true, imageURL: item.imagenURL })}
                  >
                    <IonIcon icon={eye} />
                  </IonButton>
                  <IonButton
                    fill="clear"
                    className="p-0 m-0"
                    onClick={() => setShowBarcodeImageModal({ open: true, barcodeURL: item.barcodeURL })}
                  >
                    <IonIcon icon={barcode} />
                  </IonButton>
                  <DeleteButton itemId={item.id} onDeleteSuccess={fetchData} />
                </div>
              </IonItem>
            ))}
          </IonList>
        </div>
      </div>

      <IonModal
        isOpen={showProductImageModal.open}
        onDidDismiss={() => setShowProductImageModal({ open: false, imageURL: null })}
      >
        <div className="flex flex-col items-center justify-center p-4">
          {showProductImageModal.imageURL && (
            <>
              <img 
                src={showProductImageModal.imageURL} 
                alt="Imagen del Producto" 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
              />
              <IonButton
                className="mt-4"
                onClick={() => handleDownloadImage(showProductImageModal.imageURL!)}
              >
                <IonIcon icon={downloadOutline} slot="start" />
                Descargar Imagen
              </IonButton>
            </>
          )}
        </div>
      </IonModal>

      <IonModal
        isOpen={showBarcodeImageModal.open}
        onDidDismiss={() => setShowBarcodeImageModal({ open: false, barcodeURL: null })}
      >
        <div className="flex flex-col items-center justify-center p-4">
          {showBarcodeImageModal.barcodeURL && (
            <>
              <img 
                src={showBarcodeImageModal.barcodeURL} 
                alt="Código de Barras" 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
              />
              <IonButton
                className="mt-4"
                onClick={() => handleDownloadImage(showBarcodeImageModal.barcodeURL!)}
              >
                <IonIcon icon={downloadOutline} slot="start" />
                Descargar Imagen
              </IonButton>
            </>
          )}
        </div>
      </IonModal>

      {estadoFrom && (
        <UserCreation
          abrir={estadoFrom}
          cerra={() => setEstadoFrom(false)}
        />
      )}
      {openForm && selectedItem && (
        <UpdateUser
          open={openForm}
          close={() => setOpenForm(false)}
          item={selectedItem}
        />
      )}
    </IonContent>
  );
};

export default Table;
