import gql from "graphql-tag";

var fragments = {
  note: gql`
    fragment Note on NoteNode {
      id
      title
      content
      created
      edited
      pinned
      order
      color
      __typename
    }
  `
};

export const IS_AUTHENTICATED = gql`
  query {
    isAuthenticated @client
  }
`;

export const TOKEN_IS_VALID = gql`
  query tokenIsValid($key: String!) {
    tokenIsValid(key: $key)
  }
`;

export const LOGOUT = gql`
  mutation logout($key: String!) {
    logout(input: { key: $key }) {
      detail
    }
  }
`;

export const NOTES_COMPONENT = gql`
  query AllNotes($amount: Int = 20, $cursor: String) {
    selectedNotes @client
    allNotes(first: $amount, after: $cursor) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          ...Note
        }
      }
    }
  }
  ${fragments.note}
`;

export const NUM_OF_PINNED_UNPINNED_NOTES = gql`
  query {
    numOfPinnedNotes @client
    numOfNotPinnedNotes @client
  }
`;

export const ALL_NOTES = gql`
  query AllNotes($amount: Int = 20, $cursor: String) {
    allNotes(first: $amount, after: $cursor) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          ...Note
        }
      }
    }
  }
  ${fragments.note}
`;

export const UPDATE_COLOR = gql`
  mutation UpdateNote($id: ID!, $color: String) {
    updateNote(input: { id: $id, color: $color }) {
      newNote {
        ...Note
      }
    }
  }
  ${fragments.note}
`;

export const ADD_NOTE = gql`
  mutation AddNote($title: String, $content: String) {
    addNote(input: { title: $title, content: $content }) {
      clientMutationId
      newNote {
        ...Note
      }
    }
  }
  ${fragments.note}
`;

export const DELETE_NOTES = gql`
  mutation DeleteNotes($ids: [ID]!) {
    deleteNotes(input: { ids: $ids }) {
      deletedNotes {
        id
      }
    }
  }
`;

export const SWITCH_NOTES_SELECTOR = gql`
  mutation switchNotesSelector($id: ID!, $isSelected: Boolean!) {
    switchNotesSelector(id: $id, isSelected: $isSelected) @client
  }
`;

export const ALL_COLORS = gql`
  query {
    allColors
  }
`;

export const UPDATE_NOTES_COLOR = gql`
  mutation updateNotesColor($id: ID!, $newColor: String!) {
    updateNotesColor(input: { id: $id, newColor: $newColor }) {
      newColor
    }
  }
`;

export const SWITCH_PIN_NOTES = gql`
  mutation switchPinNotes($ids: [ID]!, $action: String!) {
    switchPinNotes(input: { ids: $ids, action: $action }) {
      action
      prevPinnedStatus
      curPinnedStatus
      prevOrder
      curOrder
    }
  }
`;

export const REORDER_NOTE = gql`
  mutation reorderNote($id: ID!, $newOrder: Int!) {
    reorderNote(input: { id: $id, newOrder: $newOrder }) {
      oldOrder
      newOrder
      pinned
    }
  }
`;
