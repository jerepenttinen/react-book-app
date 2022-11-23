import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({
  children,
}: {
  children: React.ReactNode | React.ReactNode[] | undefined;
}) {
  return (
    <div className="drawer drawer-mobile">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex max-w-full scroll-pt-20 flex-col scroll-smooth">
        <Topbar />
        <main className="prose w-full max-w-4xl flex-grow overflow-x-auto p-6 lg:overflow-x-visible">
          {children}
        </main>
      </div>
      <Sidebar />
    </div>
  );
}
