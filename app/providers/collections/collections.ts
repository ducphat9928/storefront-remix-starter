import gql from 'graphql-tag';
import { sdk } from '../../graphqlWrapper';
import { CollectionListOptions } from '~/generated/graphql';

// Fragment chung cho collection details
const collectionDetailsFragment = gql`
  fragment CollectionDetails on Collection {
    id
    name
    slug
    breadcrumbs {
      id
      name
      slug
    }
    parent {
      name
    }
    productVariants {
      items {
        id
        customFields
        price
        product {
          name
          slug
          featuredAsset {
            preview
          }
        }
      }
    }
    children {
      id
      name
      slug
      featuredAsset {
        id
        preview
      }
    }
    featuredAsset {
      id
      preview
    }
  }
`;

// Query lấy danh sách collections, sử dụng fragment
gql`
  query collections($options: CollectionListOptions) {
    collections(options: $options) {
      items {
        ...CollectionDetails
      }
    }
  }
  ${collectionDetailsFragment}
`;

// Query lấy chi tiết 1 collection theo slug hoặc id
gql`
  query collection($slug: String, $id: ID) {
    collection(slug: $slug, id: $id) {
      ...CollectionDetails
    }
  }
  ${collectionDetailsFragment}
`;

// Hàm lấy danh sách collections
export function getCollections(request: Request, options?: CollectionListOptions) {
  return sdk.collections({ options }, { request }).then((result) => result.collections?.items);
}

// Hàm lấy chi tiết 1 collection
export function getCollection(request: Request, variables: { slug?: string; id?: string }) {
  return sdk.collection(variables, { request }).then((result) => result.collection);
}
