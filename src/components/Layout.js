import React from 'react';
import SideBar from './SideBar';

export default function Layout({ children }) {
  return (
    <div>
      <SideBar />
      <div className="main-content-with-sidebar">
        {children}
      </div>
    </div>
  );
}
