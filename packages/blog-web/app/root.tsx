import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { SangteProvider } from "sangte";
import { type User } from "./lib/api/types";
import { userState } from "./states/user";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import styles from "./styles/app.css";
import reactMdeStyles from "react-mde/lib/styles/css/react-mde-all.css";

import { setClientCookie } from "./lib/client";
import { getMyUserInfo } from "./lib/protected";
import { useRef } from "react";
import GlobalModal from "./components/base/GlobalModal";
interface LoaderResult {
  user: User | null;
  env: {
    API_BASE_URL: string;
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  const cookie = request.headers.get("Cookie");

  const env = {
    API_BASE_URL: process.env.API_BASE_URL,
  };
  if (!cookie) return json({ user: null, env });
  try {
    setClientCookie(cookie);
    const { user, headers } = await getMyUserInfo();

    return json({ user, env }, { headers });
  } catch (e) {
    // console.log("e1", e);
    return json({ user: null, env });
  }
};

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: reactMdeStyles },
    {
      rel: "stylesheet",
      href: "https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.1.0/github-markdown-light.css",
    },
  ];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "강경원 블로그",
  viewport: "width=device-width,initial-scale=1",
  "og:image": "https://avatars.githubusercontent.com/u/73323028?v=4",
});

export default function App() {
  const { user, env } = useLoaderData<LoaderResult>();

  const queryClient = useRef(
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 5,
        },
      },
    })
  ).current;

  return (
    <html lang="ko">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-100">
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.ENV = ${JSON.stringify(env)}
          `,
          }}
        />
        <SangteProvider
          initialize={({ set }) => {
            set(userState, user);
          }}
        >
          <QueryClientProvider client={queryClient}>
            <Outlet />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
            <GlobalModal />
            {/* <ReactQueryDevtools /> */}
          </QueryClientProvider>
        </SangteProvider>
      </body>
    </html>
  );
}
