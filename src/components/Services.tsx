import { IonItem, IonLabel, IonList } from '@ionic/react';

import CFE from '../img/CFE.png';
import Recargas from '../img/conectasur.png';
import Curp from '../img/gobiernodemexico.png';

const Services = () => {
    return (
        <div className="p-4 bg-[#232323] rounded-2xl border border-transparent shadow-md text-white mb-4 ">
            <h2 className="text-xl font-bold mb-4">Servicios</h2>
            <IonList>
                <IonItem>
                    <a href="https://www.gob.mx/curp/" target="_blank" rel="noopener noreferrer">
                        <img src={Curp} alt="CURP" className="mr-2" style={{  height: '1.5rem' }} />
                        <IonLabel>CURP</IonLabel>
                    </a>
                </IonItem>
                <IonItem>
                    <a href="https://app.cfe.mx/Aplicaciones/CCFE/MiEspacio/Login.aspx" target="_blank" rel="noopener noreferrer">
                        <img src={CFE} alt="CFE" className="mr-2" style={{  height: '1.2rem' }} />
                        <IonLabel>Recibo de luz</IonLabel>
                    </a>
                </IonItem>
                <IonItem>
                    <a href="https://www.conectasur.mx/" target="_blank" rel="noopener noreferrer">
                        <img src={Recargas} alt="Recargas" className="mr-2" style={{ height: '1.5rem' }} />
                        <IonLabel>Recargas</IonLabel>
                    </a>
                </IonItem>
            </IonList>
        </div>
    );
};

export default Services;
