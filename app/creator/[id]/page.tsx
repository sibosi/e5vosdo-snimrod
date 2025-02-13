import { Params } from "next/dist/server/request/params";
import OriginalCreatorPage from "../page";

export default async function CreatorPage(context: {
  params: Promise<Params>;
}) {
  const id = Number((await context.params).id);
  return OriginalCreatorPage({ id: id });
}
