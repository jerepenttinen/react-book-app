import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({
  children,
}: {
  children: React.ReactNode | React.ReactNode[] | undefined;
}) {
  return (
    <div className="flex h-screen flex-row">
      <Sidebar />
      <div className="flex w-full flex-col">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
