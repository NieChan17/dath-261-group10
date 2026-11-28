import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const HOP_BY_HOP_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "keep-alive",
  "upgrade",
]);

function resolveBackendBaseUrl(): URL | null {
  const raw = process.env.BACKEND_PROXY_URL?.trim().replace(/\/+$/, "");
  if (!raw) {
    return null;
  }

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const withoutApiSuffix = withScheme.replace(/\/api$/i, "");

  try {
    return new URL(withoutApiSuffix);
  } catch {
    return null;
  }
}

function buildTargetUrl(
  baseUrl: URL,
  segments: string[],
  search: string
): URL | null {
  for (const segment of segments) {
    if (!segment || segment === "." || segment === ".." || segment.includes("\\")) {
      return null;
    }
  }

  const encodedPath = segments.map((seg) => encodeURIComponent(seg)).join("/");
  const target = new URL(`/api/${encodedPath}`, baseUrl);
  target.search = search;
  return target;
}

async function proxyApiRequest(
  request: NextRequest,
  context: { params: { path: string[] } }
): Promise<NextResponse> {
  const baseUrl = resolveBackendBaseUrl();
  if (!baseUrl) {
    return NextResponse.json(
      {
        success: false,
        message: "BACKEND_PROXY_URL is not configured for the frontend API proxy",
      },
      { status: 502 }
    );
  }

  const segments = context.params?.path ?? [];
  const targetUrl = buildTargetUrl(baseUrl, segments, request.nextUrl.search);
  if (!targetUrl) {
    return NextResponse.json(
      { success: false, message: "Invalid API path" },
      { status: 400 }
    );
  }

  const forwardHeaders = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_REQUEST_HEADERS.has(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  });

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const bodyBuffer = hasBody ? await request.arrayBuffer() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: forwardHeaders,
      body: bodyBuffer && bodyBuffer.byteLength > 0 ? bodyBuffer : undefined,
      redirect: "manual",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to reach upstream backend service" },
      { status: 502 }
    );
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower !== "set-cookie" &&
      lower !== "transfer-encoding" &&
      lower !== "connection"
    ) {
      responseHeaders.set(key, value);
    }
  });

  const getSetCookie = (
    upstream.headers as unknown as { getSetCookie?: () => string[] }
  ).getSetCookie;
  if (typeof getSetCookie === "function") {
    for (const cookieHeader of getSetCookie.call(upstream.headers)) {
      responseHeaders.append("set-cookie", cookieHeader);
    }
  } else {
    const singleCookie = upstream.headers.get("set-cookie");
    if (singleCookie) {
      responseHeaders.append("set-cookie", singleCookie);
    }
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxyApiRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxyApiRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxyApiRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxyApiRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxyApiRequest(request, context);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return proxyApiRequest(request, context);
}
