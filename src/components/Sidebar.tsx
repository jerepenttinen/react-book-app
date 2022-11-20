import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  IoHomeOutline,
  IoLibraryOutline,
  IoPeopleOutline,
  IoNotificationsOutline,
} from "react-icons/io5";
import { trpc } from "~/utils/trpc";

interface IconLinkProps {
  href: string;
  icon: JSX.Element;
  text: string;
}
function IconLink(props: IconLinkProps) {
  return (
    <Link
      className="inline-flex items-baseline justify-start gap-2 py-4 text-lg font-bold"
      href={props.href}
    >
      {props.icon}
      {props.text}
    </Link>
  );
}

function Sidebar() {
  const session = useSession();
  const { data: readingBooksData } = trpc.books.getReadingBooks.useQuery(
    undefined,
    {
      retry: 0,
      enabled: !!session.data,
    },
  );
  console.log(readingBooksData);
  return (
    <div className="drawer-side">
      <ul className="menu w-72 bg-base-300">
        <li>
          <IconLink href="/" icon={<IoHomeOutline />} text="Koti" />
        </li>
        <li>
          <IconLink href="/" icon={<IoLibraryOutline />} text="Kirjasto" />
        </li>
        <li>
          <IconLink href="/" icon={<IoPeopleOutline />} text="Kaverit" />
        </li>
        <li>
          <IconLink
            href="/"
            icon={<IoNotificationsOutline />}
            text="Ilmoitukset"
          />
        </li>
        {readingBooksData && readingBooksData.length > 0 && (
          <>
            <li className="menu-title">
              <span>Parhaillaan lukemassa</span>
            </li>
            {readingBooksData.map((savedBook) => (
              <li key={savedBook.id}>
                <a>{savedBook.book.name}</a>
              </li>
            ))}
          </>
        )}
      </ul>
      {/* Kirjoja */}
    </div>
  );
}

export default Sidebar;
