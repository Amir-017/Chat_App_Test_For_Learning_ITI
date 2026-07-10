import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { Login } from "./Auth/Login";
import { Chat } from "./Chat/Chat";
import { Register } from "./Auth/Register";
import { Header } from "./components/Header";

export default function App  (){
const location = useLocation();

  return (

    <div className="">
      {location.pathname !== '/' && location.pathname !== '/register' && <Header/>}
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>

    </div>
   
  );
};