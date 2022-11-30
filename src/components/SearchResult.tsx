import Link from "next/link";

import { type BookData } from "~/server/googlebooks/book-types";
import BookCover from "./BookCover";

export function formatTitle(book: BookData) {
  let title = "";
  if (book.volumeInfo.title) {
    title += book.volumeInfo.title;
  }
  if (book.volumeInfo.subtitle && book.volumeInfo.subtitle.length > 0) {
    title += ": " + book.volumeInfo.subtitle;
  }
  return title;
}

interface SearchResultProps {
  book: BookData;
  compact?: boolean;
}

function SearchResult({ book, compact }: SearchResultProps) {
  const volume = book.volumeInfo;

  return (
    <div className={`flex flex-row ${compact ? "gap-2" : "gap-4"}`}>
      <BookCover book={book} size="s" compact={compact} />

      <div className="flex w-4/5 flex-col">
        <Link
          href={`/books/${book.id}`}
          className={`${
            compact && "truncate text-ellipsis whitespace-nowrap"
          } font-bold`}
        >
          {formatTitle(book)}
        </Link>
        <p className="my-0">
          {volume.authors?.join(", ") ?? "Tuntematon kirjoittaja"}
        </p>
      </div>
    </div>
  );
}

export default SearchResult;
