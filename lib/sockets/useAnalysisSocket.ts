import config from '@/lib/config';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export interface AnalysisStatusPayload {
  status: string;
  [key: string]: unknown;
}

export function useAnalysisSocket(
  consultationId: string,
  onStatus: (status: string, payload: AnalysisStatusPayload) => void
) {
  useEffect(() => {
    if (!consultationId) return;
    if (!socket) {
      // Toujours utiliser le domaine public en production
      const baseURL = config.api.baseURL;
      if (typeof window !== 'undefined') {
        let wsURL = '';
        if (baseURL.includes('localhost')) {
          // Force le port 3001 pour le backend local
          wsURL = window.location.protocol === 'https:'
            ? 'wss://localhost:3001'
            : 'ws://localhost:3001';
        } else {
          wsURL = baseURL.replace(/^http(s?):\/\//, window.location.protocol === 'https:' ? 'wss://' : 'ws://');
        }
        // Le backend authentifie le handshake via le cookie de session.
        socket = io(wsURL, {
          transports: ['websocket'],
          withCredentials: true,
        });
      }
    }
    const event = `analysis:status:${consultationId}`;
    const handler = (data: AnalysisStatusPayload) => {
      onStatus(data.status, data);
    };
    // Les statuts ne sont plus diffusés à tous : il faut s'abonner à la
    // consultation (le backend vérifie la propriété), et se réabonner après
    // chaque reconnexion.
    const subscribe = () => socket?.emit('subscribe', consultationId);
    if (socket) {
      socket.on(event, handler);
      socket.on('connect', subscribe);
      if (socket.connected) subscribe();
    }
    return () => {
      if (socket) {
        socket.off(event, handler);
        socket.off('connect', subscribe);
      }
    };
  }, [consultationId, onStatus]);
}
