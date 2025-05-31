import clsx from 'clsx';

export function Button(
  props: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>
) {
  return (
    <button {...props} className={clsx(props.className)}>
      {props.children}
    </button>
  );
}
