/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import { NotFoundPage } from "@payloadcms/next/views";
import { importMap } from "../importMap";
import configPromise from "@payload-config";

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

const NotFound = ({ params, searchParams }: Args) =>
  NotFoundPage({
    config: configPromise,
    importMap,
    params,
    searchParams,
  });

export default NotFound;
