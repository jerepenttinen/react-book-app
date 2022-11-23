import Avatar from "./Avatar";
import { Dialog, Menu } from "@headlessui/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { IoSearchOutline } from "react-icons/io5";
import useDebounce from "~/hooks/useDebounce";
import { trpc } from "~/utils/trpc";
import SearchResult from "./SearchResult";
import { IoReorderThreeOutline } from "react-icons/io5";

export function Searchbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const router = useRouter();

  const { data: booksData } = trpc.books.search.useQuery(
    {
      term: debouncedSearch,
    },
    {
      // Don't run with empty search!
      enabled: !!debouncedSearch,
    },
  );

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [router.asPath]);

  const urlParams = new URLSearchParams();
  urlParams.append("q", debouncedSearch);
  const searchUrl = "/search?" + urlParams.toString();

  return (
    <>
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex w-full flex-row content-center gap-2 rounded-full border border-medium p-3 text-medium"
      >
        <IoSearchOutline size="24" />
        <span>Etsi kirjoja</span>
      </button>

      <Dialog
        as="div"
        className="modal modal-open"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <Dialog.Panel className="modal-box border border-medium">
          <Dialog.Title>
            <div className="relative flex">
              <input
                type="text"
                placeholder="Etsi kirjoja"
                className="input-bordered input w-full rounded-full pl-14 placeholder:text-medium"
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              <IoSearchOutline
                size="24"
                className="absolute inset-y-3 inset-x-4 text-medium"
              />
            </div>
          </Dialog.Title>
          {booksData && (
            <div className="my-6 flex flex-col gap-4">
              {booksData.items?.map((b) => (
                <SearchResult key={"topbar" + b.id} book={b} compact />
              ))}
            </div>
          )}
          <div className="prose text-center">
            {booksData && <Link href={searchUrl}>Näytä kaikki tulokset</Link>}
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}

function Topbar() {
  const session = useSession();
  return (
    <div className="sticky top-0 z-10 flex h-16 items-center justify-between gap-5 bg-base-300 bg-opacity-50 py-2 px-5 backdrop-blur">
      <div className="flex-none lg:hidden">
        <label htmlFor="my-drawer" className="btn-ghost btn-square btn">
          <IoReorderThreeOutline size={32} />
        </label>
      </div>
      <div className="invisible lg:visible lg:w-full lg:max-w-lg">
        <Searchbar />
      </div>

      {session.data ? (
        <div className="dropdown dropdown-end h-12">
          <Menu>
            <Menu.Button>
              <Avatar user={session.data.user} size="s" />
            </Menu.Button>
            <Menu.Items className="dropdown-content menu rounded-box w-52 border border-base-content border-opacity-25 bg-base-100 p-2 shadow-xl">
              <Link href={`/users/${session.data.user?.id}`} passHref>
                <Menu.Item as="li">
                  {({ active }) => (
                    <a
                      className={`${
                        active && "bg-primary-focus text-primary-content"
                      }`}
                    >
                      Profiili
                    </a>
                  )}
                </Menu.Item>
              </Link>

              <Link href="/api/auth/signout" passHref>
                <Menu.Item as="li">
                  {({ active }) => (
                    <a
                      className={`${
                        active && "bg-primary-focus text-primary-content"
                      }`}
                    >
                      Kirjaudu ulos
                    </a>
                  )}
                </Menu.Item>
              </Link>
            </Menu.Items>
          </Menu>
        </div>
      ) : (
        <Link href="/api/auth/signin" className="btn">
          Kirjaudu
        </Link>
      )}
    </div>
  );
}

export default Topbar;
