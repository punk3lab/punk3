import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";

import BlurImage from "@/components/BlurImage";
import Layout from "@/components/app/Layout";
import Modal from "@/components/Modal";
import LoadingDots from "@/components/app/loading-dots";
import { fetcher } from "@/lib/fetcher";
import { HttpMethod } from "@/types";
import { profiles } from "@/lib/profile";
import { server } from "config";

import type { Post, Site } from "@prisma/client";
import { useEffect } from "react";

interface SitePostData {
  posts: Array<Post>;
  site: Site | null;
}

export default function SiteIndex() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const [profile, setProfile]: any = useState(null);

  const router = useRouter();
  const { id: siteId } = router.query;

  const { data } = useSWR<SitePostData>(
    siteId && `/api/post?siteId=${siteId}&published=true`,
    fetcher,
    {
      onSuccess: (data) => {
        !data?.site && router.push("/")
      },
    }
  );

  async function createPost(siteId: string) {
    try {
      const res = await fetch(`/api/post?siteId=${siteId}`, {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("res", res);
      if (res.ok) {
        const data = await res.json();
        console.log("data", data)
        router.push(`/post/${data.postId}`);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getProfile(handle: string) {
    const p: any = await profiles(
      { handles: [handle] },
    );
    if (p.items.length > 0) {
      return p.items[0];
    }

  }

  useEffect(() => {
    async function fetchProfile() {
      const handle = data?.site?.name;
      if (handle) {
        const profile = await getProfile(handle);
        console.log("p", profile)
        setProfile(profile)
      }
    }

    fetchProfile();
  }, [data?.site?.name]);

  return (
    <Layout>
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
                  <span className="text-gray-900 text-2xl font-extrabold uppercase">{profile?.handle}</span>
                  <a className="mt-1 text-md font-bold underline"
                    href={`https://mumbai.polygonscan.com/token/0xd7b3481de00995046c7850bce9a5196b7605c367?a=${parseInt(profile?.id, 16)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Lens NFT #{parseInt(profile?.id, 16)}
                  </a>
                </div>
                <img className="w-32 h-32 flex-shrink-0 mx-auto rounded-full" src="https://files.readme.io/a0959e6-lens-logo1.svg" alt="" />
              </div>
              <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Following</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{profile?.stats.totalFollowing}</dd>
                </div>
                <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Followers</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{profile?.stats.totalFollowers}</dd>
                </div>
                <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Posts</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{profile?.stats.totalPosts}</dd>
                </div>
                <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Collects</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{profile?.stats.totalCollects}</dd>
                </div>
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

      <div className="py-20 max-w-screen-xl mx-auto px-10 sm:px-20">
        <div className="flex flex-col sm:flex-row space-y-5 sm:space-y-0 justify-between items-center">
          <h1 className="font-cal text-5xl">
            Posts for {""}
            <button className="underline" onClick={() => setShowModal(true)} >{data ? data?.site?.name : "..."}</button>
          </h1>
          <button
            onClick={() => {
              setCreatingPost(true);
              createPost(siteId as string);
            }}
            className={`${creatingPost
              ? "cursor-not-allowed bg-gray-300 border-gray-300"
              : "text-white bg-black hover:bg-white hover:text-black border-black"
              } font-cal text-lg w-3/4 sm:w-40 tracking-wide border-2 px-5 py-3 transition-all ease-in-out duration-150`}
          >
            {creatingPost ? (
              <LoadingDots />
            ) : (
              <>
                New Post <span className="ml-2">＋</span>
              </>
            )}
          </button>
        </div>
        <div className="my-10 grid gap-y-10">
          {data ? (
            data.posts.length > 0 ? (
              data.posts.map((post) => (
                <Link href={`/post/${post.id}`} key={post.id}>
                  <a>
                    <div className="flex flex-col md:flex-row md:h-60 rounded-lg overflow-hidden border border-gray-200">
                      <div className="relative w-full h-60 md:h-auto md:w-1/3 md:flex-none">
                        {post.image ? (
                          <BlurImage
                            alt={post.title ?? "Unknown Thumbnail"}
                            layout="fill"
                            objectFit="cover"
                            src={post.image}
                          />
                        ) : (
                          <div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-4xl">
                            ?
                          </div>
                        )}
                      </div>
                      <div className="relative p-10">
                        <h2 className="font-cal text-3xl">{post.title}</h2>
                        <p className="text-base my-5 line-clamp-3">
                          {post.description}
                        </p>
                        <a
                          onClick={(e) => e.stopPropagation()}
                          href={`${server(data.site?.subdomain)}/${post.slug}`}
                          target="_blank"
                          className="font-cal px-3 py-1 tracking-wide rounded bg-gray-200 text-gray-600 absolute bottom-5 left-10 whitespace-nowrap"
                        >
                          {server(data.site?.subdomain)}/{post.slug} ↗
                        </a>
                      </div>
                    </div>
                  </a>
                </Link>
              ))
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:h-60 rounded-lg overflow-hidden border border-gray-200">
                  <div className="relative w-full h-60 md:h-auto md:w-1/3 md:flex-none bg-gray-300" />
                  <div className="relative p-10 grid gap-5">
                    <div className="w-28 h-10 rounded-md bg-gray-300" />
                    <div className="w-48 h-6 rounded-md bg-gray-300" />
                    <div className="w-48 h-6 rounded-md bg-gray-300" />
                    <div className="w-48 h-6 rounded-md bg-gray-300" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-cal text-gray-600">
                    No posts yet. Click "New Post" to create one.
                  </p>
                </div>
              </>
            )
          ) : (
            [0, 1].map((i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row md:h-60 rounded-lg overflow-hidden border border-gray-200"
              >
                <div className="relative w-full h-60 md:h-auto md:w-1/3 md:flex-none bg-gray-300 animate-pulse" />
                <div className="relative p-10 grid gap-5">
                  <div className="w-28 h-10 rounded-md bg-gray-300 animate-pulse" />
                  <div className="w-48 h-6 rounded-md bg-gray-300 animate-pulse" />
                  <div className="w-48 h-6 rounded-md bg-gray-300 animate-pulse" />
                  <div className="w-48 h-6 rounded-md bg-gray-300 animate-pulse" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout >
  );
}
