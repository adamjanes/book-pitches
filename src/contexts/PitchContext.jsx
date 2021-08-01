import createDataContext from './createDataContext'

const ADD_BOOK = 'ADD_BOOK'

const initialState = {
  books: [
    {
      title: 'Harry Potter',
      author: 'JK Rowling',
      rating: '5/10',
      description: "A young orphan finds out he's a wizard",
      pitch: '',
      img_url:
        'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1474154022l/3._SY475_.jpg',
    },
    {
      title: 'Fantastic Mr. Fox',
      author: 'Roald Dahl',
      rating: '7/10',
      description: 'A fox evades farmers',
      pitch: '',
      img_url:
        'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1390097292l/6693.jpg',
    },
    {
      title: 'Fight Club',
      author: 'Chuck Palahniuk',
      rating: '7/10',
      description: 'An insommniac creates a domestic terrorist organization.',
      pitch: '',
      img_url:
        'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1558216416l/36236124._SY475_.jpg',
    },
  ],
}

const pitchReducer = (state, action) => {
  switch (action.type) {
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

export const { Provider, Context } = createDataContext(pitchReducer, { addPitch }, initialState)
