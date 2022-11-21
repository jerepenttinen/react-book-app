import { type BookData } from "~/server/googlebooks/book-types";
import Image from "next/image";
import { ImFileEmpty } from "react-icons/im";

interface BookCoverProps {
  book: BookData;
  size: "s" | "l";
  compact?: boolean;
}

const sizes = {
  s: {
    width: 64,
    height: 96,
    tw: "w-16",
    th: "h-24",
  },
  l: {
    width: 128,
    height: 192,
    tw: "w-32",
    th: "h-48",
  },
};

function BookCover({ book, size, compact }: BookCoverProps) {
  const volume = book.volumeInfo;
  const s = sizes[size];

  if (compact) {
    s.height = s.width;
    // Take number
    s.th = "h-" + s.tw.split("-")[1];
  }

  return (
    <>
      {volume.imageLinks?.thumbnail ? (
        <Image
          src={volume.imageLinks.thumbnail}
          alt={`Kirjan ${volume.title} kansikuva`}
          width={s.width}
          height={s.height}
          className="my-0 h-min rounded"
          priority
        />
      ) : (
        <div
          className={`flex ${s.tw} ${s.th} justify-center rounded bg-neutral`}
        >
          <ImFileEmpty className="my-auto" />
        </div>
      )}
    </>
  );
}

export default BookCover;
