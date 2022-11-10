import Link from "next/link";
import {
  IoHomeOutline,
  IoLibraryOutline,
  IoPeopleOutline,
  IoNotificationsOutline,
} from "react-icons/io5";

interface IconLinkProps {
  href: string;
  icon: JSX.Element;
  text: string;
}
function IconLink(props: IconLinkProps) {
  return (
    <Link
      className="inline-flex items-baseline justify-start gap-2 text-lg font-bold"
      href={props.href}
    >
      {props.icon}
      {props.text}
    </Link>
  );
}

function Sidebar() {
  return (
    <div className="flex h-full w-72 flex-col gap-8 bg-base-300 px-6 py-8">
      <IconLink href="/" icon={<IoHomeOutline />} text="Koti" />
      <IconLink href="/" icon={<IoLibraryOutline />} text="Kirjasto" />
      <IconLink href="/" icon={<IoPeopleOutline />} text="Kaverit" />
      <IconLink href="/" icon={<IoNotificationsOutline />} text="Ilmoitukset" />
      <div className="divider my-0 h-0"></div>
      <p className="text-lg font-bold">Parhaillaan lukemassa</p>
      {/* Kirjoja */}
    </div>
  );
}

export default Sidebar;
