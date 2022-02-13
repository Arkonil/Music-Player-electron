type PropType = {
  children: string;
  href: string;
};

const Link = ({ children, href }: PropType) => {
  return <a href={href}>{children}</a>;
};

export default Link;
