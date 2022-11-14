import { type User } from "@prisma/client";
import Image from "next/image";

interface AvatarProps {
  user?: Partial<User>;
  size: "s" | "m" | "l";
}

const sizes = {
  s: 40,
  m: 64,
  l: 256,
};

function Avatar(props: AvatarProps) {
  const size = sizes[props.size];
  if (!props.user) {
    return <>Error</>;
  }

  return (
    <div className={`avatar ${props.user.image || "placeholder"}`}>
      <div
        className={`rounded-full w-[${size}px] h-[${size}px] bg-primary text-primary-content`}
      >
        {props.user.image ? (
          <Image
            src={props.user?.image}
            alt="Avatar"
            width={size}
            height={size}
            className="object-contain"
          />
        ) : (
          <span>{props.user.name ?? "?"}</span>
        )}
      </div>
    </div>
  );
}

export default Avatar;
