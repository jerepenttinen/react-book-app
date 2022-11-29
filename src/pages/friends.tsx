import { type NextPage } from "next";
import { trpc } from "~/utils/trpc";
import Link from "next/link";

import { Dialog, Menu } from "@headlessui/react";
import Avatar from "~/components/Avatar";

const FriendsPage: NextPage = () => {
  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = trpc.users.getMyFriends.useQuery(undefined, {
    retry: 0,
  });

  if (isLoading) {
    return <h1>Ladataan...</h1>;
  }

  if (isError) {
    return <h1>{error.data?.code}</h1>;
  }

  return (
    <div className="flex flex-col gap-8">
      {userData.friends?.map((b) => (
        <div key={"friend" + b.id}>{b.name}
        <Menu as="div" className="dropdown dropdown-end h-12">
            <Menu.Button>
              <Avatar user={b} size="s" />
            </Menu.Button>
            <Menu.Items className="dropdown-content rounded-box flex w-32 flex-col border border-medium bg-base-100 py-4 shadow-xl">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href={`/users/${b.id}`}
                    className={`no-animation btn w-full justify-start rounded-none ${active ? "btn-primary" : ""
                      } `}
                  >
                    Profiili
                  </Link>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      ))}
    </div>
  );
};

export default FriendsPage;
