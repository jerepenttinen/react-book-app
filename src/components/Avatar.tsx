import { type User } from "@prisma/client";
import Image from "next/image";

interface AvatarProps {
  user?: Partial<User>;
  size: "s" | "l";
}

interface Sizes {
  s: [number, string, string, string];
  l: [number, string, string, string];
}

const sizes: Sizes = {
  s: [48, "w-12", "h-12", "text-lg"],
  l: [256, "w-64", "h-64", "text-7xl"],
};

function Avatar(props: AvatarProps) {
  const [size, w, h, fontSize] = sizes[props.size];
  if (!props.user) {
    return <>Error</>;
  }

  return (
    <div className={`avatar ${!props.user.image && "placeholder"}`}>
      <div
        className={`rounded-full ${w} ${h} bg-accent text-accent-content ${fontSize}`}
      >
        {props.user.image ? (
          <Image
            src={props.user.image}
            alt="Avatar"
            width={size}
            height={size}
            className="my-0 object-contain"
            priority
          />
        ) : (
          <span className="select-none">
            {props.user.name?.at(0)?.toUpperCase() ?? "?"}
          </span>
        )}
      </div>
    </div>
  );
}

export default Avatar;
