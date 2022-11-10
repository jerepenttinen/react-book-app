import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({
  children,
}: {
  children: React.ReactNode | React.ReactNode[] | undefined;
}) {
  return (
    <div className="drawer-mobile drawer">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex max-w-full scroll-pt-20 flex-col scroll-smooth">
        <Topbar />
        <main className="prose w-full max-w-4xl flex-grow p-6">{children}</main>
      </div>
      <Sidebar />
    </div>
  );
}
