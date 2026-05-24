import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import { NetworkProvider } from "./context/NetworkContext";
import { SearchProvider } from "./context/SearchContext";
import { PostProvider } from "./context/PostContext";
import { NotificationProvider } from "./context/NotificationContext";
import { CandidatureProvider } from "./context/CandidatureContext";
import { AdminProvider } from "./context/AdminContext";
import TeacherCandidatures from "./components/Candidatures/Teachercandidatures.jsx";
import AdminRoute from "./components/Admin/AdminRoute"; // Ajustez le chemin selon votre structure
import AdminDashboard from "./components/Admin/AdminDashboard";
import UsersManagement from "./components/Admin/UsersManagement";
import PostsManagement from "./components/Admin/PostsManagement";
import SignalementsManagement from "./components/Admin/SignalementsManagement";
import CatalogueManagement from "./components/Admin/CatalogueManagement";

// AUTH
import Login from "./components/AuthController/Login";
import Register from "./components/AuthController/Register";
import ForgotPassword from "./components/AuthController/ForgotPassword";
import ResetPassword from "./components/AuthController/ResetPassword";
import Dashboard from "./components/AuthController/Dashboard";
import ProtectedRoute from "./components/AuthController/ProtectedRoute";

// PAGES PRINCIPALES
import Profile from "./components/Profile/Profile";
import NetworkPage from "./components/Network/NetworkPage";
import SearchPage from "./components/Search/SearchPage";
import NotificationsPage from "./components/Notifications/NotificationsPage";

// PAGES POSTS & FEED
import Feed from "./components/Common/Feed";
import PostDetails from "./components/Common/PostDetails";
import CreatePost from "./components/Common/CreatePost";

// PAGES CANDIDATURES
import MyCandidatures from "./components/Candidatures/MyCandidatures";
import PostCandidatures from "./components/Candidatures/PostCandidatures";

//import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProfileProvider>
          <NetworkProvider>
            <SearchProvider>
              <PostProvider>
                <NotificationProvider>
                  <CandidatureProvider>
                    <AdminProvider>
                      <div className="app">
                        <Routes>
                        {/* AUTH */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                          path="/forgot-password"
                          element={<ForgotPassword />}
                        />
                        <Route
                          path="/reset-password"
                          element={<ResetPassword />}
                        />
                        {/* REDIRECTION */}
                        <Route
                          path="/"
                          element={<Navigate to="/feed" replace />}
                        />
                        {/* DASHBOARD */}
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <Dashboard />
                            </ProtectedRoute>
                          }
                        />
                        {/* FEED */}
                        <Route
                          path="/feed"
                          element={
                            <ProtectedRoute>
                              <Feed />
                            </ProtectedRoute>
                          }
                        />
                        {/* POSTS */}
                        <Route
                          path="/posts/:id"
                          element={
                            <ProtectedRoute>
                              <PostDetails />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/create-post"
                          element={
                            <ProtectedRoute>
                              <CreatePost />
                            </ProtectedRoute>
                          }
                        />
                        {/* CANDIDATURES */}
                        <Route
                          path="/candidatures"
                          element={
                            <ProtectedRoute>
                              <MyCandidatures />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/candidatures/postuler/:postId"
                          element={
                            <ProtectedRoute>
                              <PostCandidatures />
                            </ProtectedRoute>
                          }
                        />
                        {/* AUTRES */}
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          }
                        />
                        {/* Après la route "/profile" existante, ajoutez */}
                        <Route
                          path="/profile/:userId"
                          element={
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/network"
                          element={
                            <ProtectedRoute>
                              <NetworkPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/messages"
                          element={
                            <ProtectedRoute>
                              <NetworkPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/messages/:userId"
                          element={
                            <ProtectedRoute>
                              <NetworkPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/search"
                          element={
                            <ProtectedRoute>
                              <SearchPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/notifications"
                          element={
                            <ProtectedRoute>
                              <NotificationsPage />
                            </ProtectedRoute>
                          }
                        />
                        {/* À l’intérieur des Routes, après la route /candidatures */}
                        <Route
                          path="/teacher/candidatures"
                          element={
                            <ProtectedRoute>
                              <TeacherCandidatures />
                            </ProtectedRoute>
                          }
                        />
                        {/* ESPACE ADMIN */}
                        <Route
                          path="/admin"
                          element={
                            <AdminRoute>
                              <AdminDashboard />
                            </AdminRoute>
                          }
                        />
                        <Route
                          path="/admin/users"
                          element={
                            <AdminRoute>
                              <UsersManagement />
                            </AdminRoute>
                          }
                        />
                        <Route
                          path="/admin/posts"
                          element={
                            <AdminRoute>
                              <PostsManagement />
                            </AdminRoute>
                          }
                        />
                        <Route
                          path="/admin/signalements"
                          element={
                            <AdminRoute>
                              <SignalementsManagement />
                            </AdminRoute>
                          }
                        />
                        <Route
                          path="/admin/catalogues"
                          element={
                            <AdminRoute>
                              <CatalogueManagement />
                            </AdminRoute>
                          }
                        />
                        {/* FALLBACK */}
                        <Route
                          path="*"
                          element={<Navigate to="/feed" replace />}
                        />
                        </Routes>
                      </div>
                    </AdminProvider>
                  </CandidatureProvider>
                </NotificationProvider>
              </PostProvider>
            </SearchProvider>
          </NetworkProvider>
        </ProfileProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
