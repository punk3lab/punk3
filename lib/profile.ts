import { gql } from "@apollo/client/core";
import { apolloClient } from "./apollo-client";
import { login } from "./auth";
import { getAddressFromSigner } from "./ethers.service";
import { prettyJSON } from "./helpers";
import { pollUntilIndexed } from "./indexer";

const CREATE_PROFILE = `
  mutation($request: CreateProfileRequest!) { 
    createProfile(request: $request) {
      ... on RelayerResult {
        txHash
      }
      ... on RelayError {
        reason
      }
			__typename
    }
 }
`;

const createProfileRequest = (createProfileRequest: {
  handle: string;
  profilePictureUri?: string;
  followNFTURI?: string;
}) => {
  return apolloClient.mutate({
    mutation: gql(CREATE_PROFILE),
    variables: {
      request: createProfileRequest,
    },
  });
};

export const createProfile = async (handle: string) => {
  const address = await getAddressFromSigner();
  console.log("create profile: address", address);

  await login(address);

  const result = await createProfileRequest({
    handle: handle,
  });

  prettyJSON("create profile: result", result.data);

  if (result.data.createProfile.__typename === "RelayError") {
    throw new Error(result.data.createProfile.reason);
  }

  console.log("poll until indexed");
  await pollUntilIndexed(result.data.createProfile.txHash);

  console.log("profile has been indexed");

  return result.data;
};

const GET_PROFILES = `
  query($request: ProfileQueryRequest!) {
    profiles(request: $request) {
      items {
        id
        name
        bio
        location
        website
        twitterUrl
        picture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        handle
        coverPicture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        ownedBy
        depatcher {
          address
          canUseRelay
        }
        stats {
          totalFollowers
          totalFollowing
          totalPosts
          totalComments
          totalMirrors
          totalPublications
          totalCollects
        }
        followModule {
          ... on FeeFollowModuleSettings {
            type
            amount {
              asset {
                symbol
                name
                decimals
                address
              }
              value
            }
            recipient
          }
          __typename
        }
      }
      pageInfo {
        prev
        next
        totalCount
      }
    }
  }
`;

export interface ProfilesRequest {
  profileIds?: string[];
  ownedBy?: string;
  handles?: string[];
  whoMirroredPublicationId?: string;
}

const getProfilesRequest = (request: ProfilesRequest) => {
  return apolloClient.query({
    query: gql(GET_PROFILES),
    variables: {
      request,
      limit: 20,
    },
  });
};

export const profiles = async (request: ProfilesRequest) => {
  const profilesFromProfileIds = await getProfilesRequest(request);

  prettyJSON("profiles: result", profilesFromProfileIds.data);

  return profilesFromProfileIds.data.profiles;
};
