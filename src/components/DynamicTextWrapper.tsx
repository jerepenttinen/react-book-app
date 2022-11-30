interface DynamicTextWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function DynamicTextWrapper(props: DynamicTextWrapperProps) {
  return (
    <div className={"whitespace-pre-wrap break-words " + props.className}>
      {props.children}
    </div>
  );
}
