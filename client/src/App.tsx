import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";

import Notes from "@/pages/notes";
import NoteDetail from "@/pages/note-detail";
import Forum from "@/pages/forum";
import ForumTopic from "@/pages/forum-topic";
import Profile from "@/pages/profile";
import Reports from "@/pages/reports";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected routes */}
      <Route path="/" component={() => (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      )} />
      <Route path="/dashboard" component={() => (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      )} />
      <Route path="/courses" component={() => (
        <ProtectedRoute>
          <Courses />
        </ProtectedRoute>
      )} />
      <Route path="/courses/:id" component={() => (
        <ProtectedRoute>
          <CourseDetail />
        </ProtectedRoute>
      )} />
      <Route path="/notes" component={() => (
        <ProtectedRoute>
          <Notes />
        </ProtectedRoute>
      )} />
      <Route path="/notes/:id" component={() => (
        <ProtectedRoute>
          <NoteDetail />
        </ProtectedRoute>
      )} />
      <Route path="/forum" component={() => (
        <ProtectedRoute>
          <Forum />
        </ProtectedRoute>
      )} />
      <Route path="/forum/topics/:id" component={() => (
        <ProtectedRoute>
          <ForumTopic />
        </ProtectedRoute>
      )} />
      <Route path="/profile" component={() => (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      )} />
      <Route path="/reports" component={() => (
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      )} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
