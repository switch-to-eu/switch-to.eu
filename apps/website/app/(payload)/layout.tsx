/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { ServerFunctionClient } from "payload";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import { importMap } from "./admin/importMap";
import configPromise from "@payload-config";
import React from "react";

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async (args) => {
  "use server";
  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  });
};

const Layout = ({ children }: Args) =>
  RootLayout({
    children,
    config: configPromise,
    importMap,
    serverFunction,
  });

export default Layout;
