import { type NextPage } from "next/types";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  flexRender,
  useReactTable,
} from "@tanstack/react-table";
import { type RouterTypes, trpc } from "~/utils/trpc";
import BookCover from "~/components/BookCover";
import { IoCloseOutline } from "react-icons/io5";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Dialog } from "@headlessui/react";
import { type Book } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

type RowType = RouterTypes["books"]["getSavedBooks"]["output"][number];
const columnHelper = createColumnHelper<RowType>();

export function formatDate(date?: Date | null) {
  return date ? dayjs(date).format("DD.MM.YYYY") : "";
}

const shelves = new Map<string, string>([
  ["shelf", "Hyllyssä"],
  ["reading", "Lukemassa"],
  ["read", "Luettu"],
]);

function useBookDialog(
  book: Book | undefined = undefined,
): [Book | undefined, (book: Book) => void, boolean, () => void] {
  const [targetBook, setTargetBook] = useState<Book | undefined>(book);

  return [
    targetBook,
    (book: Book) => setTargetBook(book),
    targetBook !== undefined, // isOpen
    () => setTargetBook(undefined), // close
  ];
}

const LibraryPage: NextPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const session = useSession();

  const [isMyLibrary, setIsMyLibrary] = useState(
    userId === session.data?.user?.id,
  );
  useEffect(() => {
    setIsMyLibrary(userId === session.data?.user?.id);
  }, [session.data?.user?.id, userId]);

  const { data } = trpc.books.getSavedBooks.useQuery(
    {
      userId: userId as string,
    },
    {
      enabled: !!userId,
    },
  );

  const [sorting, setSorting] = useState<SortingState>([]);

  const tableData = data ?? ([] as RowType[]);

  const trpcContext = trpc.useContext();
  const updateSavedBook = trpc.books.updateSavedBook.useMutation();

  const [book, setBook, modalIsOpen, closeModal] = useBookDialog();

  const columns = useMemo(
    () => [
      columnHelper.accessor("book", {
        header: () => <span>Kansi</span>,
        cell: (cell) => <BookCover book={cell.getValue()} size="s" />,
        enableSorting: false,
      }),
      columnHelper.accessor("book.name", {
        header: () => <span>Nimi</span>,
        cell: (cell) => (
          <Link href={`/books/${cell.row.original.bookId}`}>
            {cell.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("book.authors", {
        header: () => <span>Kirjailija</span>,
      }),
      columnHelper.accessor("book.reviews", {
        header: () => <span>Arvostelu</span>,
        cell: (cell) => {
          const score = (cell.getValue().at(0)?.score ?? 0) / 2;
          const starPercentages = [0, 0, 0, 0, 0];

          for (let i = 0; i < score; i++) {
            starPercentages[i] = 1;
          }

          if (score < 5) {
            // Set last star to the fraction of the score
            starPercentages[Math.floor(score)] = score % 1;
          }
          return (
            <button
              type="button"
              className="btn-ghost no-animation btn-sm btn inline-flex w-max gap-px px-0"
            >
              {starPercentages.map((perc, i) => (
                <div key={i + "star"} className="relative h-4 w-4">
                  <div
                    style={{ width: `${perc}rem` }}
                    className="absolute h-4 overflow-hidden"
                  >
                    <div className="mask mask-star-2 h-4 w-4 bg-secondary"></div>
                  </div>
                  <div className="mask mask-star-2 absolute h-4 w-4 bg-secondary/20"></div>
                </div>
              ))}
            </button>
          );
        },
        enableSorting: false,
      }),
      columnHelper.accessor("shelf", {
        header: () => <span>Hylly</span>,
        cell: (cell) => shelves.get(cell.getValue()),
      }),
      columnHelper.accessor("finishedAt", {
        header: () => <span>Luettu</span>,
        cell: (cell) => formatDate(cell.getValue()),
      }),
      columnHelper.accessor("createdAt", {
        header: () => <span>Lisätty</span>,
        cell: (cell) => formatDate(cell.getValue()),
      }),
      columnHelper.accessor("book.id", {
        header: () => <span></span>,
        cell: (cell) => {
          return (
            <>
              {isMyLibrary ? (
                <button
                  type="button"
                  className="btn-sm btn-circle btn"
                  onClick={() => {
                    setBook(cell.row.original.book);
                  }}
                >
                  <IoCloseOutline className="h-5 w-5" />
                </button>
              ) : (
                <div></div>
              )}
            </>
          );
        },
        enableSorting: false,
      }),
    ],
    [setBook, isMyLibrary],
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : (
                    <div
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="align-top">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog
        as="div"
        className="modal modal-open"
        open={modalIsOpen}
        onClose={closeModal}
      >
        <Dialog.Panel className="prose modal-box border border-base-content border-opacity-20">
          <Dialog.Title as="h3">Poista kirja</Dialog.Title>
          <p>
            Haluatko varmasti poistaa kirjan {book?.name + " "}
            kirjastostasi? Tätä toimintoa ei voi peruuttaa.
          </p>

          <div className="flex flex-row justify-end gap-4">
            <button
              className="btn-outline btn"
              onClick={async () => {
                await updateSavedBook.mutateAsync(
                  {
                    bookId: book?.id ?? "",
                    shelf: "none",
                  },
                  {
                    onSuccess: () => {
                      trpcContext.books.getSavedBooks.setData(
                        data?.filter((b) => b.bookId !== book?.id),
                      );
                      trpcContext.books.getReadingBooks.invalidate();
                    },
                  },
                );

                closeModal();
              }}
            >
              Poista
            </button>
            <button className="btn-error btn" onClick={closeModal}>
              Peruuta
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
};

export default LibraryPage;
