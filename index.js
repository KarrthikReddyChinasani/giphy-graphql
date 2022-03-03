import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";

const API = "https://api.giphy.com/v1/gifs";
const REACT_APP_GIPHY_TOKEN = "Ef8ZU9CPnMHMykJtdEZikxSQgqvmTTFV";

// Construct a schema, using GraphQL schema language
const typeDefs = gql`

  directive @cacheControl(
    maxAge: Int,
    scope: CacheControlScope
  ) on OBJECT | FIELD | FIELD_DEFINITION

  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }

  type Gifs @cacheControl(maxAge: 1000) {
		id: String
		title: String
    images: Image
    user: User
	}

  type Pagination @cacheControl(maxAge: 1000) {
    total_count: String
    count: String
    offset: String
  }

  type Trending  @cacheControl(maxAge: 1000) {
    gifs: [Gifs],
    pagination: Pagination
  }

  type Search @cacheControl(maxAge: 1000) {
    gifs: [Gifs],
    pagination: Pagination
  }

  type Query {
    trending(offset: Int): Trending,
    search(q: String, offset: Int): Search,
  }

	type Image @cacheControl(maxAge: 1000) {
		original: ImageSize
    preview: ImageSize
    downsized: ImageSize
	}

  type ImageSize @cacheControl(maxAge: 1000) {
    height: String!
    width: String!
    url: String!
  }

  type User @cacheControl(maxAge: 1000) {
    display_name: String!
    avatar_url: String!
    username: String!
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    trending: async (parent, args, context, info) => {
      const results = await fetch(`${API}/trending?api_key=${REACT_APP_GIPHY_TOKEN}&limit=25&rating=g&offset=${args.offset}`);
      const res = await results.json();
      return { gifs: res.data, pagination: res.pagination};
    },
    search: async (parent, args, context, info) => {
      const results = await fetch(`${API}/search?api_key=${REACT_APP_GIPHY_TOKEN}&limit=25&rating=g&offset=${args.offset}&q=${args.q}`);
      const res = await results.json();
      return { gifs: res.data, pagination: res.pagination};
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cacheControl: {
    defaultMaxAge: 1000,
  },
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
