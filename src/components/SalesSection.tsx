import React, { useState, useEffect, useCallback } from 'react';
import { IonButton, IonItem, IonLabel, IonList, IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons } from '@ionic/react';
import { collection, getDocs, addDoc, query, orderBy, Timestamp, where, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Button } from '@nextui-org/react';
import '../Styles/Scroll.css';

interface Sale {
  timestamp?: Date;
  producto: string;
  codigo: string;
  cantidad: number;
  precioUnitario: number | null;
  precio: number | null;
}

interface Report {
  id: string;
  date: Timestamp;
  url: string;
}

function SalesSection() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);
  const [showReports, setShowReports] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
  }

  const fetchSales = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const salesCollection = collection(db, 'ventas');
      const salesQuery = query(
        salesCollection,
        orderBy('timestamp', 'desc'),
        where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
        where('timestamp', '<=', Timestamp.fromDate(endOfDay))
      );
      const salesSnapshot = await getDocs(salesQuery);
      const salesData = salesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          producto: data.producto || 'N/A',
          codigo: data.codigo || 'N/A',
          cantidad: data.cantidad !== undefined && data.cantidad !== null ? Number(data.cantidad) : 0,
          precio: data.total !== undefined && data.total !== null ? Number(data.total) : 0,
          timestamp: data.timestamp ? data.timestamp.toDate() : null,
          precioUnitario: data.precioUnitario !== undefined && data.precioUnitario !== null ? Number(data.precioUnitario) : 0,
        } as Sale;
      });
      setSales(salesData);

      const total = salesData.reduce((acc, curr) => acc + (curr.precio ?? 0), 0);
      setTotalSales(total);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const reportsCollection = collection(db, 'reportes');
      const reportsQuery = query(reportsCollection, orderBy('date', 'desc'));
      const reportsSnapshot = await getDocs(reportsQuery);
      const reportsData = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchReports();
  }, []);
  const generateReport = useCallback(async () => {
    if (!sales.length) {
      console.error("No hay ventas para generar el reporte");
      return;
    }
  
    const doc = new jsPDF() as jsPDFWithAutoTable;
  
    const title = "Reporte de ventas del día";
    const fontSize = 18;
    doc.setFontSize(fontSize);
    const pageWidth = doc.internal.pageSize.width;
    const titleWidth = doc.getStringUnitWidth(title) * fontSize / doc.internal.scaleFactor;
    const titleX = (pageWidth - titleWidth) / 2;
  
    doc.text(title, titleX, 20);
  
    const tempTable = document.createElement('table');
    tempTable.innerHTML = `
      <thead>
        <tr>
          <th>Fecha y Hora</th>
          <th>Nombre del Producto</th>
          <th>Código del Producto</th>
          <th>Cantidad</th>
          <th>Precio Unitario o Costo total de reparacion</th>
          <th>Precio Total o Importe</th>
        </tr>
      </thead>
      <tbody>
        ${sales.map(sale => `
          <tr>
            <td>${sale.timestamp ? sale.timestamp.toLocaleString() : 'N/A'}</td>
            <td>${sale.producto}</td>
            <td>${sale.codigo}</td>
            <td>${sale.cantidad}</td>
            <td>${sale.precioUnitario != null ? `$${sale.precioUnitario.toFixed(2)}` : 'N/A'}</td>
            <td>${sale.precio != null ? `$${sale.precio.toFixed(2)}` : 'N/A'}</td>
          </tr>
        `).join('')}
        <tr>
          <td colspan="5" align="right"><b>Total:</b></td>
          <td><b>$${totalSales.toFixed(2)}</b></td>
        </tr>
      </tbody>
    `;
  
    doc.autoTable({
      html: tempTable,
      startY: 30,
      styles: { overflow: 'linebreak' },
      columnStyles: { text: { cellWidth: 'wrap' } },
    });
  
    const pdfBlob = doc.output('blob');
    
    const pdfRef = ref(storage, `reportes/reporte_ventas_${Date.now()}.pdf`);
    try {
      await uploadBytes(pdfRef, pdfBlob);
      const pdfUrl = await getDownloadURL(pdfRef);
  
      const reportDoc = await addDoc(collection(db, 'reportes'), {
        date: Timestamp.fromDate(new Date()),
        url: pdfUrl,
      });
  
      console.log('Reporte guardado con ID:', reportDoc.id);
  
      fetchReports();
    } catch (error) {
      console.error('Error saving report:', error);
    }
  
    const generateReportFileName = () => {
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
  
      return `ReporteVentasMLP${day}${month}${year}.pdf`;
    };
  
    doc.save(generateReportFileName());
  }, [sales, totalSales]);
  

  const handleDeleteReport = async () => {
    if (selectedReport) {
      try {
        const reportRef = doc(db, 'reportes', selectedReport);
        await deleteDoc(reportRef);
        console.log('Reporte eliminado con ID:', selectedReport);

        fetchReports();
        setShowConfirmModal(false);
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const toggleReportsVisibility = () => {
    setShowReports(prevState => !prevState);
    if (!showReports) {
      setLoadingReports(true);
      fetchReports();
    }
  };

  return (
    <div className="p-4 bg-[#232323] rounded-2xl border border-transparent shadow-md text-white mb-4">
      <h2 className="text-xl font-bold mb-4">Ventas del día</h2>
      <div className="sales-list-container">
        <SalesTable sales={sales} />
      </div>
      <p className="font-bold">Total de venta: ${totalSales.toFixed(2)}</p>
      <div className="flex justify-end mt-4">
        <Button color="primary" onClick={generateReport}>Generar Reporte</Button>
        <Button color="secondary" onClick={toggleReportsVisibility} className="ml-2">
          {showReports ? 'Ocultar Reportes' : 'Ver Reportes Anteriores'}
        </Button>
      </div>

      {showReports && (
        <div>
          <h3 className="mt-4 mb-2">Reportes Guardados</h3>
          <IonList>
            {reports.map((report) => (
              <IonItem key={report.id}>
                <IonLabel>{report.date.toDate().toLocaleDateString()}</IonLabel>
                <IonButton onClick={() => window.open(report.url, '_blank')} className="mr-2">
                  Ver Reporte
                </IonButton>
                <IonButton color="danger" onClick={() => { setSelectedReport(report.id); setShowConfirmModal(true); }}>
                  Eliminar
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        </div>
      )}

      <IonModal isOpen={showConfirmModal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Confirmar Eliminación</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowConfirmModal(false)}>Cerrar</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>¿Estás seguro de que deseas eliminar este reporte?</p>
          <div className="flex justify-end mt-4">
            <IonButton color="danger" onClick={handleDeleteReport}>Eliminar</IonButton>
            <IonButton onClick={() => setShowConfirmModal(false)} className="ml-2">
              Cancelar
            </IonButton>
          </div>
        </IonContent>
      </IonModal>
    </div>
  );
}

interface SalesTableProps {
  sales: Sale[];
}

function SalesTable({ sales }: SalesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-00 text-white border border-gray-700">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Prod.</th>
            <th className="py-2 px-4 border-b">Código de barras o folio</th>
            <th className="py-2 px-4 border-b">C.</th>
            <th className="py-2 px-4 border-b">Precio Unitario</th>
            <th className="py-2 px-4 border-b">Precio Total o Anticipo</th>
            <th className="py-2 px-4 border-b">Fecha y Hora</th>
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4 text-center">Aun no hay ventas hoy.</td>
            </tr>
          ) : (
            sales.map((sale, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b">{sale.producto}</td>
                <td className="py-2 px-4 border-b">{sale.codigo}</td>
                <td className="py-2 px-4 border-b">{sale.cantidad}</td>
                <td className="py-2 px-4 border-b">${sale.precioUnitario?.toFixed(2) || 'N/A'}</td>
                <td className="py-2 px-4 border-b">${sale.precio?.toFixed(2) || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{sale.timestamp?.toLocaleString() || 'N/A'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}


export default SalesSection;
