// @refresh reload
import { Suspense } from "solid-js";
import {
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import 'virtual:uno.css';

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>Nodes monitor</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body class="bg-hex-A0CECD w-min-full h-min-full m-0">
        <Suspense>
          <ErrorBoundary>
            <div class="flex w-full bg-op-80 bg-hex-AECE4B justify-center">
              <div class="flex">
                <A class="bg-hex-14B3B1 text-hex-fff filter-drop-shadow px-10 py-4 mr-0 shadow-xl" href="https://romenet.io/">Home</A>
                <A class="bg-hex-14B3B1 text-hex-fff filter-drop-shadow px-10 py-4 mx-0 shadow-xl" href="/">Monitor</A>
              </div>
            </div>
            <Routes>
              <FileRoutes/>
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
