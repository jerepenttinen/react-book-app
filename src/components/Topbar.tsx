// import Avatar from "./Avatar";
import { IoSearchOutline } from "react-icons/io5";

function Topbar() {
  return (
    <div className="flex h-16 w-full flex-row items-center justify-between gap-5 bg-base-300 py-2 px-5">
      <div className="relative flex w-full min-w-min max-w-lg">
        <input
          type="text"
          placeholder="Etsi kirjoja"
          className="input-bordered input w-full rounded-full pl-14"
        />
        <IoSearchOutline size="24" className="absolute inset-y-3 inset-x-4" />
      </div>

      {/* <Avatar src="/pfp.png" alt="Profile picture" size="s" /> */}
      <div className="placeholder avatar">
        <div className="w-12 rounded-full bg-primary text-primary-content">
          JP
        </div>
      </div>
    </div>
  );
}

export default Topbar;
