import { NextResponse, type NextRequest } from "next/server";

const STORE_HOST = process.env.NEXT_PUBLIC_STORE_HOST ?? "store.e-talase.com";
const BUILDER_HOST = process.env.NEXT_PUBLIC_BUILDER_HOST ?? "builder.e-talase.com";

const BUILDER_PATH_PREFIXES = ["/docs", "/preview", "/api/auth", "/api/sdk-docs"];
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

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  const { pathname } = request.nextUrl;

  if (isStoreHost(host)) {
    if (pathname.startsWith("/api/")) {
      const apiAllowed =
        request.method === "GET" &&
        STORE_ALLOWED_API.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
      return apiAllowed ? NextResponse.next() : new NextResponse(null, { status: 404 });
    }

    if (isStoreAlias(pathname)) return NextResponse.next();

    if (isBuilderPath(pathname)) return redirectTo(request, BUILDER_HOST);

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
