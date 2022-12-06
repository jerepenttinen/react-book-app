import Link from "next/link";

interface UserLinkProps {
  user: {
    id?: string | null;
    name?: string | null;
  };
  className?: string;
}

function UserLink({ user, className }: UserLinkProps) {
  return (
    <Link href={`/users/${user.id}`} className={className} {...!!user.name ? {"title": user.name} : null}>
      {user.name}
    </Link>
  );
}

export default UserLink;
