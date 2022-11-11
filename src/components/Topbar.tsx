// import Avatar from "./Avatar";
import { Dialog } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { IoSearchOutline } from "react-icons/io5";
import useDebounce from "~/hooks/useDebounce";
import { trpc } from "~/utils/trpc";
import SearchResult from "./SearchResult";

function Searchbar() {
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
        className="inline-flex w-full max-w-lg flex-row content-center gap-2 rounded-full border border-base-content border-opacity-20 p-3"
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
        <Dialog.Panel className="modal-box border border-base-content border-opacity-20">
          <Dialog.Title>
            <div className="relative flex">
              <input
                type="text"
                placeholder="Etsi kirjoja"
                className="input-bordered input w-full rounded-full pl-14"
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              <IoSearchOutline
                size="24"
                className="absolute inset-y-3 inset-x-4"
              />
            </div>
          </Dialog.Title>
          {booksData && (
            <div className="my-6 flex flex-col gap-4">
              {booksData.items.map((b) => (
                <SearchResult key={b.id} book={b} compact />
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
  return (
    <div className="sticky top-0 z-10 flex h-16 items-center justify-between gap-5 bg-base-300 bg-opacity-50 py-2 px-5 backdrop-blur">
      <Searchbar />

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
