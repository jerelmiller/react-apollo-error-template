import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  gql,
  useQuery,
  useMutation,
  useLazyQuery,
} from "@apollo/client";

import { link } from "./link.js";
import { Subscriptions } from "./subscriptions.jsx";
import { Layout } from "./layout.jsx";
import "./index.css";

const GET_PERSON = gql`
  query GetPerson($id: ID!) {
    person(id: $id) {
      id
      firstName
      post {
        id
      }
    }
  }
`;

const GET_PERSON_FULL = gql`
  query GetPerson($id: ID!) {
    person(id: $id) {
      id
      firstName
      lastName
      post {
        id
      }
    }
  }
`;

const ADD_PERSON = gql`
  mutation AddPerson($name: String) {
    addPerson(name: $name) {
      id
      name
      post {
        id
      }
    }
  }
`;

const UPDATE_PERSON = gql`
  mutation UpdatePerson($id: ID!) {
    updatePerson(id: $id) {
      id
      firstName
      post {
        id
      }
    }
  }
`;

function App() {
  const [name, setName] = useState("");
  const { client, loading, data, error } = useQuery(GET_PERSON, {
    variables: { id: "1" },
  });
  const [getPerson, { data: lazyData }] = useLazyQuery(GET_PERSON_FULL);

  console.log({ data, lazyData });

  const [addPerson] = useMutation(ADD_PERSON, {
    update: (cache, { data: { addPerson: addPersonData } }) => {
      const peopleResult = cache.readQuery({ query: GET_PERSON });

      cache.writeQuery({
        query: GET_PERSON,
        data: {
          ...peopleResult,
          people: [...peopleResult.people, addPersonData],
        },
      });
    },
  });

  const [updatePerson] = useMutation(UPDATE_PERSON);

  return (
    <main>
      <h3>Home</h3>
      <div className="add-person">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(evt) => setName(evt.target.value)}
        />
        <button
          onClick={() => {
            addPerson({ variables: { name } });
            setName("");
          }}
        >
          Add person
        </button>
        <button
          onClick={() => {
            updatePerson({ variables: { id: "1" } });
          }}
        >
          Update person
        </button>
        <button
          onClick={() => {
            getPerson({ variables: { id: "1" } });
          }}
        >
          Get full person
        </button>
        <button
          onClick={() => {
            client.cache.modify({
              id: client.cache.identify({ __typename: "Person", id: "1" }),
              fields: {
                firstName: (_, { DELETE }) => DELETE,
              },
            });
          }}
        >
          Partial cache write
        </button>
        <button
          onClick={() => {
            client.writeQuery({
              query: GET_PERSON,
              data: {
                people: [
                  {
                    __typename: "Person",
                    id: 1,
                    name: "Test User",
                    alwaysFails: "true",
                  },
                ],
              },
            });
          }}
        >
          Cache write
        </button>
      </div>
      <h2>Names</h2>
      {error && <div style={{ color: "red" }}>{error.message}</div>}
      {loading ? <p>Loading…</p> : <ul>{JSON.stringify(data, null, 2)}</ul>}
    </main>
  );
}

const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Person: {
        fields: {
          post: {
            merge: () => ({}),
          },
        },
      },
    },
  }),
  link,
});

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ApolloProvider client={client}>
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="subscriptions-wslink" element={<Subscriptions />} />
        </Route>
      </Routes>
    </Router>
  </ApolloProvider>,
);
