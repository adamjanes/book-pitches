import React from 'react'
import {
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  makeStyles,
} from '@material-ui/core'

const books = [
  {
    title: 'Harry Potter',
    author: 'JK Rowling',
    rating: '5/10',
    description: "A young orphan finds out he's a wizard",
    img_url:
      'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1474154022l/3._SY475_.jpg',
  },
  {
    title: 'Fantastic Mr. Fox',
    author: 'Roald Dahl',
    rating: '7/10',
    description: 'A fox evades farmers',
    img_url:
      'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1390097292l/6693.jpg',
  },
  {
    title: 'Fight Club',
    author: 'Chuck Palahniuk',
    rating: '7/10',
    description: 'An insommniac creates a domestic terrorist organization.',
    img_url:
      'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1558216416l/36236124._SY475_.jpg',
  },
]

const useStyles = makeStyles({
  paper: {
    flex: 1,
    padding: '20px 40px',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: '20px',
  },
  cardContainer: {},
  card: {
    height: '375px',
  },
  cardImage: {
    width: '100%',
    height: '250px',
    backgroundSize: 'cover',
  },
  cardTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})

const Main = () => {
  const classes = useStyles()

  const cards = books.map(book => (
    <Grid item xs={12} md={4}>
      <Card className={classes.card} key={book.title}>
        <CardActionArea>
          <CardMedia className={classes.cardImage} image={book.img_url} title={book.title} />
          <CardContent>
            <div className={classes.cardTitle}>
              <Typography gutterBottom variant="h5">
                {book.title}
              </Typography>
              <Typography gutterBottom variant="body1">
                {book.rating}
              </Typography>
            </div>
            <Typography variant="body2" color="textSecondary" component="p">
              {book.description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  ))

  // TODO: search request from Google Books API for adding new pitch
  // URL - https://www.googleapis.com/books/v1/volumes?q=harry+potter
  // API KEY - AIzaSyDaS2usw0H_q5oo1pxfnyeWRzNWoheWaXY

  return (
    <Paper className={classes.paper}>
      <div className={classes.titleContainer}>
        <Typography variant="h3">My Pitches</Typography>
        <Button variant="contained" color="primary">
          Create a review
        </Button>
      </div>
      <Grid container className={classes.cardContainer} spacing={2}>
        {cards}
      </Grid>
    </Paper>
  )
}

export default Main
