import axios from 'axios';
import SockJS from 'sockjs-client';
import { over } from 'stompjs';
import { API_URL } from '../config';

export const changerStatutCommande = async (id, nouveauStatut) => {
  // 1. Mise à jour dans la base MySQL via l'API REST avec paramètre de requête (?nouveauStatut=...)
  await axios.put(`${API_URL}/commandes/${id}/statut?nouveauStatut=${nouveauStatut}`);

  // 2. Envoi du signal WebSocket en temps réel via SockJS
  return new Promise((resolve) => {
    try {
      let sockEnvoi = new SockJS('http://localhost:8181/ws');
      let clientEnvoi = over(sockEnvoi);

      // Désactiver le log de debug STOMP pour garder la console propre
      clientEnvoi.debug = null;

      clientEnvoi.connect({}, () => {
        clientEnvoi.send("/app/update-livraison", {}, JSON.stringify({
          commandeId: id,
          statut: nouveauStatut,
          message: `La commande #${id} est passée au statut : ${nouveauStatut.replace(/_/g, ' ')}`
        }));
        // On ferme la connexion après l'envoi
        setTimeout(() => {
          sockEnvoi.close();
          resolve();
        }, 500);
      }, (err) => {
        console.error("Erreur de connexion WebSocket pour l'envoi", err);
        resolve(); // Résout quand même pour ne pas bloquer l'UI
      });
    } catch (e) {
      console.error("Erreur WebSocket globale", e);
      resolve();
    }
  });
};
