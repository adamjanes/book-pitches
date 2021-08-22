import createDataContext from './createDataContext'
import firebase from 'firebase'

const ADD_BOOK = 'ADD_BOOK'
const FETCH_BOOKS = 'FETCH_BOOKS'

const initialState = {
  books: [],
}

const pitchReducer = (state, action) => {
  switch (action.type) {
    case FETCH_BOOKS:
      return { ...state, books: action.payload }
    case ADD_BOOK:
      return { ...state, books: [...state.books, action.payload] }
    default:
      return state
  }
}

const addPitch = dispatch => async payload => {
  try {
    dispatch({ type: ADD_BOOK, payload })
  } catch (err) {
    console.log('Error!')
  }
}

const fetchBooks = dispatch => async () => {
  try {
    const books = firebase
      .database()
      .ref('books')
      .on('value', snapshot => {
        dispatch({ type: FETCH_BOOKS, payload: snapshot.val() })
      })
  } catch (err) {
    console.log('error')
  }
}

export const { Provider, Context } = createDataContext(
  pitchReducer,
  { addPitch, fetchBooks },
  initialState
)
