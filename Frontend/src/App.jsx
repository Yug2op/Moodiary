
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import NotFoundPage from "./pages/404Error";
import ProtectedRoute from "./components/ProtectedRoute";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import MoodEntryPage from "./pages/MoodEntryPage";
import FriendsNetworkPage from "./pages/FriendsNetworkPage";

export default function App() {
  
  return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/" element={<HomePage />} />
        

        <Route element={<ProtectedRoute />}>
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/insights" element={<AnalyticsPage />} />
        <Route path="/mood" element={<MoodEntryPage />} />
        <Route path="/friends" element={<FriendsNetworkPage />} />
        </Route>
      </Routes>
  );  
}
