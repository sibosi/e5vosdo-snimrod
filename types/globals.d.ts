declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.sass" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.module.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.module.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.module.sass" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.css?url" {
  const content: string;
  export default content;
}

declare module "*.css" {
  const content: any;
  export = content;
}
