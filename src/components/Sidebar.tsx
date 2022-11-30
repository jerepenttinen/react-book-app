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
import { Searchbar } from "./Topbar";

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

function NotificationsLink() {
  const session = useSession();
  const { data: notificationCountData } =
    trpc.users.getMyNotificationsCount.useQuery(undefined, {
      retry: 0,
      enabled: !!session.data,
    });
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Link
      className="inline-flex items-baseline justify-start gap-2 py-4 text-lg font-bold"
      href="/notifications"
      onMouseOver={() => setIsHovering(true)}
      onMouseOut={() => setIsHovering(false)}
    >
      <div className="indicator">
        <span
          className={`badge-error badge badge-xs indicator-item ${
            notificationCountData ? "" : "hidden"
          }`}
        >
          {notificationCountData}
        </span>
        {isHovering ? <IoNotifications /> : <IoNotificationsOutline />}
      </div>
      Ilmoitukset
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
    <div className="drawer-side text-lg">
      <label htmlFor="my-drawer" className="drawer-overlay"></label>
      <ul className="menu w-72 bg-base-300">
        <li>
          <IconLink
            href="/"
            icon={<IoHomeOutline />}
            hoverIcon={<IoHome />}
            text="Koti"
          />
        </li>
        {!!session.data?.user ? (
          <>
            <li>
              <IconLink
                href={`/users/${session.data?.user?.id}/library`}
                icon={<IoLibraryOutline />}
                hoverIcon={<IoLibrary />}
                text="Kirjasto"
              />
            </li>
            <li>
              <IconLink
                href="/friends"
                icon={<IoPeopleOutline />}
                hoverIcon={<IoPeople />}
                text="Kaverit"
              />
            </li>
            <li>
              <NotificationsLink />
            </li>
          </>
        ) : (
          <></>
        )}
        <div className="visible mx-4 mt-4 mb-2 lg:hidden">
          <Searchbar />
        </div>
        {readingBooksData && readingBooksData.length > 0 && (
          <>
            <section className="mb-8 mt-6 flex flex-col gap-8 px-4">
              <div className="divider my-0 text-medium"></div>
              <span className="text-lg font-bold">Parhaillaan lukemassa</span>
              {readingBooksData.map((savedBook) => (
                <div key={savedBook.id} className="flex h-min flex-row gap-4">
                  <BookCover
                    book={savedBook.book}
                    size="s"
                    key={savedBook.id + "sidecover"}
                  />
                  <div className="flex w-3/4 flex-col gap-1 p-0">
                    <Link
                      href={`/books/${savedBook.bookId}`}
                      className="font-bold"
                    >
                      {savedBook.book.name}
                    </Link>
                    <span className="text-xs">
                      {savedBook.book.authors ?? "Tuntematon kirjoittaja"}
                    </span>
                    <button
                      type="button"
                      className="btn-xs btn bordered w-min border-medium px-8 hover:border-medium/50"
                    >
                      Päivitä
                    </button>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </ul>
    </div>
  );
}

export default Sidebar;
