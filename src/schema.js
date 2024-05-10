/*** SCHEMA ***/
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
} from "graphql";

let count = 0;

const PostType = new GraphQLObjectType({
  name: "Post",
  fields: {
    id: { type: GraphQLID },
  },
});

const PersonType = new GraphQLObjectType({
  name: "Person",
  fields: {
    id: { type: GraphQLID },
    firstName: {
      type: GraphQLString,
      resolve: (person) => {
        const found = peopleData.find((p) => person.id === p.id);

        return person.firstName === found.firstName
          ? person.firstName + ` (${count++})`
          : person.firstName;
        // if (count++ === 0) {
        //   throw new Error("Could not get first name");
        // }

        // return person.firstName + ` (${count++})`;
      },
    },
    lastName: { type: GraphQLString },
    post: { type: PostType, resolve: () => ({ id: 1 }) },
  },
});

const peopleData = [
  { id: 1, firstName: "John", lastName: "Smith" },
  { id: 2, firstName: "Sara", lastName: "Smith" },
  { id: 3, firstName: "Budd", lastName: "Deey" },
];

const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    people: {
      type: new GraphQLList(PersonType),
      resolve: () => peopleData,
    },
    person: {
      type: PersonType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (_, args) =>
        peopleData.find((person) => person.id === Number(args.id)) ?? null,
    },
  },
});

const MutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addPerson: {
      type: PersonType,
      args: {
        name: { type: GraphQLString },
      },
      resolve: function (_, { name }) {
        const person = {
          id: peopleData[peopleData.length - 1].id + 1,
          name,
        };

        peopleData.push(person);
        return person;
      },
    },
    updatePerson: {
      type: PersonType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: function (_, { id }) {
        const person = peopleData.find((person) => person.id === Number(id));

        return { ...person, firstName: person.firstName + " (mutated)" };
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
});
