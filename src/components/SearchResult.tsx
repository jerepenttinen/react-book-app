import Link from "next/link";
import Image from "next/image";

import { type BookData } from "~/server/googlebooks/fetchBooks";
import { ImFileEmpty } from "react-icons/im";

function formatTitle(book: BookData) {
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
  const [imageWidth, imageHeight] = compact ? [64, 64] : [64, 96];

  return (
    <div className={`flex flex-row ${compact ? "gap-2" : "gap-4"}`}>
      <Link
        href={`/books/${book.id}`}
        className={`w-16 rounded ${compact ? "h-16 overflow-clip" : "h-24"}`}
      >
        {volume.imageLinks ? (
          <Image
            src={volume.imageLinks.thumbnail}
            alt={`Kirjan ${volume.title} kansikuva`}
            width={imageWidth}
            height={imageHeight}
            className="my-0 w-auto rounded"
            priority
          />
        ) : (
          <div className="flex h-full w-full justify-center rounded bg-neutral">
            <ImFileEmpty className="my-auto" />
          </div>
        )}
      </Link>

      <div className="prose flex w-4/5 flex-col">
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
