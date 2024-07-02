/*** APP ***/
import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  gql,
  useMutation,
  useQuery,
} from "@apollo/client";

import { link } from "./link.js";
import { Layout } from "./layout.jsx";
import "./index.css";

const ALL_PEOPLE = gql`
  query AllPeople {
    people {
      id
      name
    }
  }
`;

const INCREMENT_MUTATION = gql`
  mutation IncrementCount($personId: ID!, $silent: Boolean!) {
    incrementCount(personId: $personId) {
      id
      name @skip(if: $silent)
    }
  }
`;

function App() {
  const { loading, data, client, refetch } = useQuery(ALL_PEOPLE, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      console.log("onCompleted", data);
    },
  });

  const [increment] = useMutation(INCREMENT_MUTATION);

  return (
    <main>
      <h3>Names</h3>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <button
            onClick={() => {
              client.cache.modify({
                id: client.cache.identify({
                  __typename: "Person",
                  id: data?.people[0]?.id,
                }),
                fields: {
                  name: (name) => {
                    console.log("modify", name);
                    return name + " (modified)";
                  },
                },
              });
            }}
          >
            Update first user
          </button>
          &nbsp;
          <button onClick={() => refetch()}>Refetch</button>
          <ul>
            {data?.people.map((person) => (
              <li key={person.id}>
                {person.name}{" "}
                <button
                  onClick={() =>
                    increment({
                      variables: { personId: person.id, silent: false },
                    })
                  }
                >
                  +
                </button>
                &nbsp;
                <button
                  onClick={() =>
                    increment({
                      variables: { personId: person.id, silent: true },
                    })
                  }
                >
                  + (silent)
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});

function Root() {
  return (
    <ApolloProvider client={client}>
      <Layout>
        <App />
      </Layout>
    </ApolloProvider>
  );
}

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<Root />);
