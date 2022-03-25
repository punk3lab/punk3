import Link from "next/link";
import remarkMdx from "remark-mdx";
import { MDXRemote } from "next-mdx-remote";
import { remark } from "remark";
import { serialize } from "next-mdx-remote/serialize";
import { useRouter } from "next/router";
import { useState } from "react";
import Modal from "@/components/Modal";

import BlogCard from "@/components/BlogCard";
import BlurImage from "@/components/BlurImage";
import Date from "@/components/Date";
import Examples from "@/components/mdx/Examples";
import Layout from "@/components/sites/Layout";
import Loader from "@/components/sites/Loader";
import prisma from "@/lib/prisma";
import Tweet from "@/components/mdx/Tweet";
import { shortAddress } from "@/lib/helpers";
import { server } from "config"
import { getPublication } from "@/lib/publication";
import { getPubId } from "@/lib/helpers";

import {
  replaceExamples,
  replaceLinks,
  replaceTweets,
} from "@/lib/remark-plugins";

import type { AdjacentPost, Meta, _SiteSlugData } from "@/types";
import type { GetStaticPaths, GetStaticProps } from "next";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import type { ParsedUrlQuery } from "querystring";
import { UserCircleIcon } from "@heroicons/react/solid";
import { DocumentReportIcon, UserIcon } from "@heroicons/react/outline";

const components = {
  a: replaceLinks,
  BlurImage,
  Examples,
  Tweet,
};

interface PathProps extends ParsedUrlQuery {
  site: string;
  slug: string;
}

interface PostProps {
  stringifiedData: string;
  stringifiedAdjacentPosts: string;
}

export default function Post({
  stringifiedAdjacentPosts,
  stringifiedData,
}: PostProps) {
  const router = useRouter();
  if (router.isFallback) return <Loader />;
  const [showModal, setShowModal] = useState<boolean>(false);

  const data: any = JSON.parse(stringifiedData) as _SiteSlugData & {
    mdxSource: MDXRemoteSerializeResult<Record<string, unknown>>;
  };
  const adjacentPosts = JSON.parse(
    stringifiedAdjacentPosts
  ) as Array<AdjacentPost>;

  const meta = {
    description: data.description,
    logo: "/logo.svg",
    ogImage: data.image,
    ogUrl: `${server(data.site?.subdomain)}/${data.slug}`,
    title: data.title,
  } as Meta;

  console.log(data)

  return (
    <Layout meta={meta} subdomain={data.site?.subdomain ?? undefined}>
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <div
          className="inline-block w-full max-w-md pt-8 overflow-hidden text-center align-middle transition-all bg-white shadow-xl rounded-lg"
        >
          <div
            className="col-span-1 flex flex-col text-center bg-white rounded-lg shadow divide-y divide-gray-200"
          >
            <div className="flex-1 flex flex-col p-8">
              <div className="flex flex-row mx-auto items-center justify-between space-x-10">
                <div className="flex flex-col space-y-3">
                  <span className="text-gray-900 text-2xl font-extrabold uppercase">{data.publication?.handle}</span>
                  <a className="mt-1 text-md font-bold underline"
                    href={`https://mumbai.polygonscan.com/token/0xd7b3481de00995046c7850bce9a5196b7605c367`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Publication #{parseInt(getPubId(data.publication?.id), 16)}
                  </a>
                </div>
                <img className="w-32 h-32 flex-shrink-0 mx-auto rounded-full" src="https://files.readme.io/a0959e6-lens-logo1.svg" alt="" />
              </div>
              <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Mirrors</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.publication?.stats.totalAmountOfMirrors}</dd>
                </div>
                <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Collects</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.publication?.stats.totalAmountOfCollects}</dd>
                </div>
                <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Comments</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.publication?.stats.totalAmountOfComments}</dd>
                </div>
                {/* <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Collects</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.publication?.stats.totalCollects}</dd>
                </div> */}
              </dl>

            </div>
            <div>
              <div className="-mt-px flex divide-x divide-gray-200">
                <div className="w-0 flex-1 flex">
                  <button
                    className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="ml-3">Close</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </Modal>

      <div className="flex flex-col justify-center items-center">
        <div className="text-center w-full md:w-7/12 m-auto">
          <p className="text-sm md:text-base font-light text-gray-500 w-10/12 m-auto my-5">
            <Date dateString={data.createdAt.toString()} />
          </p>
          <h1 className="font-bold text-3xl font-cal md:text-6xl mb-10 text-gray-800">
            {data.title}
          </h1>
          <p className="text-md md:text-lg text-gray-600 w-10/12 m-auto">
            {data.description}
          </p>
        </div>
        <div
        >
          <div className="my-8">
            <div className="relative w-8 h-8 md:w-12 md:h-12 rounded-full overflow-hidden inline-block align-middle">
              {data.site?.user?.image ? (
                <BlurImage
                  alt={data.site?.user?.name ?? "User Avatar"}
                  height={80}
                  src={data.site.user.image}
                  width={80}
                />
              ) : (
                <div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-4xl select-none">
                  ?
                </div>
              )}
            </div>
            <a className="inline-block text-md md:text-lg align-middle ml-3"
              target="_blank"
              href={`https://mumbai.polygonscan.com/address/${data.site.user.name}`}
            >
              by <span className="font-semibold" title={data.site?.user?.name}>{shortAddress(data.site?.user?.name)}</span>
            </a>
            <div className="inline-block text-md md:text-lg align-middle ml-3 underline cursor-pointer w-6 h-auto"
              onClick={() => setShowModal(true)}
            >
              <DocumentReportIcon />
            </div>
          </div>
        </div>
      </div>
      <div className="relative h-80 md:h-150 w-full max-w-screen-lg lg:2/3 md:w-5/6 m-auto mb-10 md:mb-20 md:rounded-2xl overflow-hidden">
        {data.image ? (
          <BlurImage
            alt={data.title ?? "Post image"}
            layout="fill"
            objectFit="cover"
            placeholder="blur"
            blurDataURL={data.imageBlurhash ?? undefined}
            src={data.image}
          />
        ) : (
          <div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-4xl select-none">
            ?
          </div>
        )}
      </div>

      <article className="w-11/12 sm:w-3/4 m-auto prose prose-md sm:prose-lg">
        <MDXRemote {...data.mdxSource} components={components} />
      </article>

      {
        adjacentPosts.length > 0 && (
          <div className="relative mt-10 sm:mt-20 mb-20">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-white text-sm text-gray-500">
                Continue Reading
              </span>
            </div>
          </div>
        )
      }
      {
        adjacentPosts && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-8 mx-5 lg:mx-12 2xl:mx-auto mb-20 max-w-screen-xl">
            {adjacentPosts.map((data, index) => (
              <BlogCard key={index} data={data} />
            ))}
          </div>
        )
      }
    </Layout >
  );
}

export const getStaticPaths: GetStaticPaths<PathProps> = async () => {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      // you can remove this if you want to generate all sites at build time
      site: {
        subdomain: "demo",
      },
    },
    select: {
      slug: true,
      site: {
        select: {
          subdomain: true,
          customDomain: true,
        },
      },
    },
  });

  return {
    paths: posts.flatMap((post) => {
      if (post.site === null || post.site.subdomain === null) return [];

      if (post.site.customDomain) {
        return [
          {
            params: {
              site: post.site.customDomain,
              slug: post.slug,
            },
          },
          {
            params: {
              site: post.site.subdomain,
              slug: post.slug,
            },
          },
        ];
      } else {
        return {
          params: {
            site: post.site.subdomain,
            slug: post.slug,
          },
        };
      }
    }),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<PostProps, PathProps> = async ({
  params,
}) => {
  if (!params) throw new Error("No path parameters found");

  const { site, slug } = params;

  let filter: {
    subdomain?: string;
    customDomain?: string;
  } = {
    subdomain: site,
  };

  if (site.includes(".")) {
    filter = {
      customDomain: site,
    };
  }

  // fetch data in db
  const data: any = (await prisma.post.findFirst({
    where: {
      site: {
        ...filter,
      },
      slug,
    },
    include: {
      site: {
        include: {
          user: true,
        },
      },
    },
  })) as _SiteSlugData | null;

  if (!data) return { notFound: true, revalidate: 10 };

  // fetch publication from lens graphql
  const publication = await getPublication(data.pubId);

  const [mdxSource, adjacentPosts] = await Promise.all([
    getMdxSource(data.content!),
    prisma.post.findMany({
      where: {
        site: {
          ...filter,
        },
        published: true,
        NOT: {
          id: data.id,
        },
      },
      select: {
        slug: true,
        title: true,
        createdAt: true,
        description: true,
        image: true,
        imageBlurhash: true,
      },
    }),
  ]);

  return {
    props: {
      stringifiedData: JSON.stringify({
        ...data,
        publication,
        mdxSource,
      }),
      stringifiedAdjacentPosts: JSON.stringify(adjacentPosts),
    },
    revalidate: 3600,
  };
};

async function getMdxSource(postContents: string) {
  // Use remark plugins to convert markdown into HTML string
  const processedContent = await remark()
    // Native remark plugin that parses markdown into MDX
    .use(remarkMdx)
    // Replaces tweets with static <Tweet /> component
    .use(replaceTweets)
    // Replaces examples with <Example /> component (only for demo.punk3.xyz)
    .use(() => replaceExamples(prisma))
    .process(postContents);

  // Convert converted html to string format
  const contentHtml = String(processedContent);

  // Serialize the content string into MDX
  const mdxSource = await serialize(contentHtml);

  return mdxSource;
}
