import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import LoadingDots from "@/components/app/loading-dots";
import toast, { Toaster } from "react-hot-toast";
import { signIn, signOut, useSession } from 'next-auth/react';
import { useConnect, useAccount, useNetwork, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { shortAddress } from "@/lib/helpers";
import { useRouter } from "next/router";

const pageTitle = "Login";
const logo = "/favicon.ico";
const description = "punk3.xyz is a web3 blogging platform for crypto punks.";
export default function Login() {
  const [{ data, error }, connect] = useConnect();
  const router = useRouter();
  const { data: session }: any = useSession();
  const [{ data: accountData, error: aerr, loading: aloading }, disconnect] = useAccount({ fetchEns: true });
  const [loading, setLoading] = useState(false);
  const [{ data: networkData }] = useNetwork();
  const [, signMessage] = useSignMessage();

  const signInWithSig = useCallback(async () => {
    try {
      const address = accountData?.address;
      const chainId = networkData?.chain?.id;
      if (!address || !chainId) return;
      setLoading(true);
      // Fetch random nonce, create SIWE message, and sign with wallet
      const nonceRes = await fetch("/api/nonce");
      const nonceData = await nonceRes.json();
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in with Ethereum to the app.",
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce: nonceData['nonce'],
      });
      const prepareMessage = message.prepareMessage();
      const signRes = await signMessage({ message: prepareMessage });
      if (signRes.error) throw signRes.error;
      console.log("signRes success", prepareMessage);

      // signin(verify and create user)
      const signinRes: any = await signIn('credentials', { message: prepareMessage, signature: signRes.data, redirect: false });
      if (signinRes.error) {
        toast.error("Error signin");
      } else {
        router.reload();
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("signin error" + error);
    }
  }, [[accountData, networkData]]);


  useEffect(() => {
    const errorMessage = error?.message;
    errorMessage && toast.error(errorMessage) && setLoading(false);
    accountData && setLoading(false);
  }, [error, accountData]);


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>{pageTitle}</title>
        <link rel="icon" href={logo} />
        <link rel="shortcut icon" type="image/x-icon" href={logo} />
        <link rel="apple-touch-icon" sizes="180x180" href={logo} />
        <meta name="theme-color" content="#7b46f6" />

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta itemProp="name" content={pageTitle} />
        <meta itemProp="description" content={description} />
        <meta itemProp="image" content={logo} />
        <meta name="description" content={description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={logo} />
        <meta property="og:type" content="website" />

        {/* <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@punk3" />
        <meta name="twitter:creator" content="@punk3" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={logo} /> */}
      </Head>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/logo.svg"
          alt="Punk3"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Punk3
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Build web3 blog with custom domains. <br /> Read the{" "}
          <a
            // href="https://demo.punk3.xyz/platforms-starter-kit"
            target="_blank"
            className="font-medium text-black hover:text-gray-800"
          >
            blog post
          </a>
        </p>
      </div>

      <div className="mt-8 mx-auto sm:w-full w-11/12 sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-lg sm:px-10">
          {loading ? (
            <div className={`${loading ? "cursor-not-allowed bg-gray-600" : "bg-black"
              } group flex justify-center items-center space-x-5 w-full sm:px-4 h-16 my-2 rounded-md focus:outline-none`}
            >
              <LoadingDots color="#fff" />
            </div>
          ) :
            accountData ?
              <div className={`${loading ? "cursor-not-allowed bg-gray-600" : "bg-black"
                } group flex justify-center items-center space-x-5 w-full sm:px-4 h-16 my-2 rounded-md focus:outline-none`}
              >
                <span className="text-base text-gray-200">
                  {shortAddress(accountData.address)}
                </span>
                <button
                  className="text-base text-gray-200 underline"
                  onClick={disconnect}
                >
                  Disconnect
                </button>

              </div>
              :
              data.connectors.map((connector) => (
                <button
                  key={connector.id}
                  disabled={loading}
                  onClick={() => {
                    setLoading(true);
                    connect(connector);
                  }}
                  className={`${loading ? "cursor-not-allowed bg-gray-600" : "bg-black"
                    } group flex justify-center items-center space-x-5 w-full sm:px-4 h-16 my-2 rounded-md focus:outline-none`}
                >
                  <span className="text-base text-gray-200">
                    {connector.name}
                    {!connector.ready && " (unsupported)"}
                  </span>
                </button>
              ))
          }

          {accountData && (
            <div className="bg-blue-600 rounded-md">
              {session?.user?.address ? (
                <div>
                  <button
                    className="group flex justify-center items-center space-x-5 w-full sm:px-4 h-16 my-2 rounded-md focus:outline-none bg-black text-white"
                    onClick={() => signOut()}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  className="group flex justify-center items-center space-x-5 w-full sm:px-4 h-16 my-2 rounded-md focus:outline-none btn btn-primary text-white"
                  disabled={loading}
                  onClick={signInWithSig}
                >
                  Sign-In with Ethereum
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div >
  );
}
