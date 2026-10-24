import { NextResponse, type NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/oldsong") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const destination = request.headers.get("sec-fetch-dest")
  const accept = request.headers.get("accept") ?? ""
  const isBrowserNavigation =
    destination === "document" || (!destination && accept.includes("text/html"))

  if (isBrowserNavigation) {
    return new NextResponse("Not Found", { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  
  matcher: ["/api/:path*", "/oldsong","/upload"],
}
