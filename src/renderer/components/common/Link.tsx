type PropType = {
  children: string;
  to: string;
};

const Link = ({ children, to }: PropType) => {
  return <a href={to}>{children}</a>;
};

export default Link;
