import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import {
  IoHomeOutline,
  IoHome,
  IoLibraryOutline,
  IoLibrary,
  IoPeopleOutline,
  IoPeople,
  IoNotificationsOutline,
  IoNotifications,
} from "react-icons/io5";
import { trpc } from "~/utils/trpc";
import BookCover from "./BookCover";

interface IconLinkProps {
  href: string;
  icon: JSX.Element;
  hoverIcon: JSX.Element;
  text: string;
}
function IconLink(props: IconLinkProps) {
  const [isHovering, setIsHovering] = useState(false);
  return (
    <Link
      className="inline-flex items-baseline justify-start gap-2 py-4 text-lg font-bold"
      href={props.href}
      onMouseOver={() => setIsHovering(true)}
      onMouseOut={() => setIsHovering(false)}
    >
      {isHovering ? props.hoverIcon : props.icon}
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

  return (
    <div className="drawer-side">
      <ul className="menu w-72 bg-base-300">
        <li>
          <IconLink
            href="/"
            icon={<IoHomeOutline />}
            hoverIcon={<IoHome />}
            text="Koti"
          />
        </li>
        <li>
          <IconLink
            href="/"
            icon={<IoLibraryOutline />}
            hoverIcon={<IoLibrary />}
            text="Kirjasto"
          />
        </li>
        <li>
          <IconLink
            href="/"
            icon={<IoPeopleOutline />}
            hoverIcon={<IoPeople />}
            text="Kaverit"
          />
        </li>
        <li>
          <IconLink
            href="/"
            icon={<IoNotificationsOutline />}
            hoverIcon={<IoNotifications />}
            text="Ilmoitukset"
          />
        </li>
        {readingBooksData && readingBooksData.length > 0 && (
          <>
            <li className="menu-title">
              <span>Parhaillaan lukemassa</span>
            </li>
            <section className="mt-2 flex flex-col gap-8">
              {readingBooksData.map((savedBook) => (
                <div
                  key={savedBook.id}
                  className="flex h-min flex-row gap-4 px-4"
                >
                  <Link
                    href={`/books/${savedBook.bookId}`}
                    className="h-24 w-16 p-0"
                  >
                    <BookCover
                      book={savedBook.book}
                      size="s"
                      key={savedBook.id + "sidecover"}
                    />
                  </Link>
                  <div className="flex w-3/5 flex-col gap-1 p-0">
                    <Link
                      href={`/books/${savedBook.bookId}`}
                      className="font-bold"
                    >
                      {savedBook.book.name}
                    </Link>
                    <span>
                      {savedBook.book.authors ?? "Tuntematon kirjoittaja"}
                    </span>
                    <button type="button" className="btn-sm btn">
                      Päivitä
                    </button>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </ul>
      {/* Kirjoja */}
    </div>
  );
}

export default Sidebar;
