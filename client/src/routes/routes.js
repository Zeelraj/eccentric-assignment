import React from "react";
import HomePage from "../pages/HomePage/HomePage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import MeetingsPage from "../pages/MeetingsPage/MeetingsPage";

const routes = [
  {
    path: "",
    element: <HomePage />,
    isPrivate: true,
  },
  {
    path: "meetings",
    element: <MeetingsPage />,
    isPrivate: true,
  },
  {
    path: "profile",
    element: <ProfilePage />,
    isPrivate: true,
  },
];

export default routes;
