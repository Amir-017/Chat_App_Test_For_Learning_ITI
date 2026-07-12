import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { SignInPage } from "./Auth/SignInPage";
import { SignUpPage } from "./Auth/SignUpPage";
import { Chat } from "./Chat/Chat";
import { Header } from "./components/Header";
import { GroupsPage } from "./Groups/GroupsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div className="">
      {location.pathname !== '/sign-in' && location.pathname !== '/sign-up' && <Header />}
      <Routes>
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route
          path="/"
          element={!isLoaded ? null : <Navigate to={isSignedIn ? "/chat" : "/sign-in"} replace />}
        />
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<Chat />} />
          <Route path="/groups" element={<GroupsPage />} />
        </Route>
      </Routes>
    </div>
  );
};
