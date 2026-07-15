import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { io } from "socket.io-client";
import api from "../Api/axios";

// Resolves the signed-in Clerk user to this app's local Mongo user id, then opens a Socket.IO
// connection authenticated with a Clerk session token (server verifies it in the handshake).
export const useAuthedSocket = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let cancelled = false;

    const setup = async () => {
      const { data } = await api.get("api/users/userInfo");
      if (cancelled) return;

      setCurrentUserId(String(data.user._id));

      const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
        auth: (cb) => getToken().then((token) => cb({ token })),
      });
      socketRef.current = newSocket;
      setSocket(newSocket);
    };

    setup();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [isLoaded, isSignedIn, getToken]);

  return { socket, currentUserId, isReady: Boolean(socket && currentUserId) };
};
