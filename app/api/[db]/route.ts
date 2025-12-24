import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  apioptions,
  apireq,
  apireqType,
  defaultApiReq,
  getAuth,
  UserType,
} from "@/db/dbreq";
import {
  SZALAGAVATO_COOKIE_NAME,
  verifySzalagavatoToken,
} from "@/lib/szalagavatoAuth";

type Params = {
  db: string;
};

// Fake user for szalagavato authenticated guests
const SZALAGAVATO_GUEST_USER: UserType = {
  name: "Szalagavató Vendég",
  full_name: "Szalagavató Vendég",
  username: "szalagavato_guest",
  nickname: "Szalagavató Vendég",
  email: "szalagavato@guest",
  image: "",
  last_login: "",
  permissions: ["media_view"],
  EJG_code: null,
  OM: null,
  OM5: null,
  food_menu: "",
  coming_year: 0,
  class_character: "",
  order_number: 0,
  tickets: [],
  push_permission: false,
  push_about_games: false,
  push_about_timetable: false,
  is_verified: false,
};

const modules = {
  parlament: import("@/db/parlament"),
  autobackup: import("@/db/autobackup"),
  event: import("@/db/event"),
  supabaseStorage: import("@/db/supabaseStorage"),
  images: import("@/db/images"),
  matches: import("@/db/matches"),
  pageSettings: import("@/db/pageSettings"),
  mediaPhotos: import("@/db/mediaPhotos"),
  mediaTags: import("@/db/mediaTags"),
};

export const GET = async (
  request: Request,
  context: { params: Promise<Params> },
) => {
  let selfUser = await getAuth();

  // Check for szalagavato cookie auth if not logged in
  if (!selfUser) {
    const cookieStore = await cookies();
    const szalagavatoCookie = cookieStore.get(SZALAGAVATO_COOKIE_NAME);
    if (verifySzalagavatoToken(szalagavatoCookie?.value || "")) {
      selfUser = SZALAGAVATO_GUEST_USER as any;
    }
  }

  const requestedModule = request.headers.get("module") ?? "";
  if (Object.keys(modules).includes(requestedModule)) {
    const body = request.method === "POST" ? await request.json() : {};
    const method = (await context.params).db;

    try {
      const mod = await modules[requestedModule as keyof typeof modules];

      if (typeof (mod as { [key: string]: any })[method] === "function") {
        return NextResponse.json(
          await (mod as { [key: string]: any })[method](
            selfUser,
            ...Object.values(body),
          ),
        );
      } else {
        console.error(`Invalid method: ${method} is not a function`);
        return NextResponse.json(
          { error: `Invalid method: ${method}` },
          { status: 400 },
        );
      }
    } catch (error) {
      console.error(`Error in ${requestedModule} module: ${error}`);
      return NextResponse.json(
        { error: `Failed to process request in ${requestedModule} module` },
        { status: 500 },
      );
    }
  }

  if (!selfUser) {
    return NextResponse.json(
      { error: "Please log in to use this API" },
      { status: 400 },
    );
  }

  const gate = (await context.params).db;
  if (apioptions.includes(gate as any) === false) {
    return NextResponse.json(
      { error: "Invalid API endpoint" },
      { status: 400 },
    );
  }

  if (!selfUser) {
    return NextResponse.json({ error: "User not found" }, { status: 500 });
  }

  const userPermissionsSet = new Set(selfUser.permissions);
  const gatePermissions = new Set(apireq[gate as apireqType].perm);

  if (
    apireq[gate as apireqType].perm != null &&
    !Array.from(gatePermissions).some((item) => userPermissionsSet.has(item))
  ) {
    return NextResponse.json(
      {
        error: `You do not have permission to use this API\nYour permissions: ${selfUser.name}`,
      },
      { status: 403 },
    );
  }

  let bodyData: string | Promise<string>;
  try {
    bodyData = JSON.parse(await request.text());
  } catch (error) {
    bodyData = "";
  }

  try {
    const data = await defaultApiReq(gate as apireqType, bodyData);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
};

export const POST = async (
  request: Request,
  context: { params: Promise<Params> },
) => {
  return await GET(request, context);
};
