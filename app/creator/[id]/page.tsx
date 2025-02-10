import { Params } from "next/dist/server/request/params";
import AboutPage from "../page";

export default async function CreatorPage(context: {
  params: Promise<Params>;
}) {
  const id = Number((await context.params).id);
  return AboutPage({ id: id });
}
