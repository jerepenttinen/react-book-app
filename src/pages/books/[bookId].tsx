import { type NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "~/utils/trpc";

import Image from "next/image";
import { ImFileEmpty } from "react-icons/im";

const BookPage: NextPage = () => {
  const router = useRouter();
  const { bookId } = router.query;

  const { data: bookData, isLoading } = trpc.books.getById.useQuery(
    {
      id: bookId as string,
    },
    {
      enabled: !!bookId,
    },
  );

  if (
    typeof bookId !== "string" ||
    bookId === undefined ||
    bookId.length === 0
  ) {
    return <></>;
  }

  if (isLoading) {
    return <>Ladataan...</>;
  }

  if (!bookData) {
    return <>Ei löydy!</>;
  }

  const volume = bookData.volumeInfo;

  return (
    <>
      <h1>{volume.title}</h1>
      {volume.imageLinks && volume.imageLinks.small ? (
        <Image
          src={volume.imageLinks.small}
          alt={`Kirjan ${volume.title} kansikuva`}
          width={150}
          height={300}
          className="my-0 h-auto rounded"
        />
      ) : (
        <div className="flex h-full w-full justify-center rounded bg-neutral">
          <ImFileEmpty className="my-auto" />
        </div>
      )}
    </>
  );
};

export default BookPage;
