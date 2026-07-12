import { NextResponse, type NextRequest } from "next/server";

const STORE_HOST = process.env.NEXT_PUBLIC_STORE_HOST ?? "store.e-talase.com";
const BUILDER_HOST = process.env.NEXT_PUBLIC_BUILDER_HOST ?? "builder.e-talase.com";
const APP_ORIGIN = (process.env.NEXT_PUBLIC_APP_ORIGIN ?? "https://app.e-talase.com").replace(/\/+$/, "");

const BUILDER_PATH_PREFIXES = ["/docs", "/preview", "/templates", "/builder", "/api/auth", "/api/sdk-docs"];
const STORE_ALLOWED_API = ["/api/stores/custom-uri"];

function isStoreHost(host: string) {
  return host === STORE_HOST;
}

function isBuilderHost(host: string) {
  return host === BUILDER_HOST;
}

function isBuilderPath(pathname: string) {
  if (pathname === "/") return true;
  return BUILDER_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isStoreAlias(pathname: string) {
  return /^\/[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])$/.test(pathname);
}

function redirectTo(request: NextRequest, host: string) {
  const url = request.nextUrl.clone();
  url.host = host;
  return NextResponse.redirect(url);
}

async function resolveAliasStoreId(request: NextRequest, alias: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/api/stores/custom-uri";
  url.search = "";
  url.searchParams.set("alias", alias);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const data = (await res.json()) as { storeId?: unknown };
  return typeof data.storeId === "string" && data.storeId ? data.storeId : null;
}

function redirectAliasToApp(request: NextRequest, storeId: string) {
  const url = new URL(request.nextUrl);
  const app = new URL(APP_ORIGIN);
  url.protocol = app.protocol;
  url.host = app.host;
  url.pathname = `/${storeId}`;
  return NextResponse.redirect(url, 308);
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  const { pathname } = request.nextUrl;

  if (isStoreHost(host)) {
    if (pathname.startsWith("/api/")) {
      const apiAllowed =
        request.method === "GET" &&
        STORE_ALLOWED_API.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
      return apiAllowed ? NextResponse.next() : new NextResponse(null, { status: 404 });
    }

    if (isBuilderPath(pathname)) return redirectTo(request, BUILDER_HOST);

    if (isStoreAlias(pathname)) {
      const storeId = await resolveAliasStoreId(request, pathname.slice(1).toLowerCase());
      if (!storeId) return new NextResponse(null, { status: 404 });
      return redirectAliasToApp(request, storeId);
    }

    return new NextResponse(null, { status: 404 });
  }

  if (isBuilderHost(host)) {
    if (pathname.startsWith("/api/")) return NextResponse.next();

    if (isBuilderPath(pathname)) return NextResponse.next();

    if (isStoreAlias(pathname)) return redirectTo(request, STORE_HOST);

    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};
