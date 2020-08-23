# About
Express server built locally using REST API to serve the data for the rConFusion Restaurant website. (https://github.com/AmmarKhalid123/rConfusion)

### conFusionServer

## Technologies:
- MongoDB ( for storing and retrieving data )
- ExpressJS ( backend server )

## API - ENDPOINTS
# /users
- get on '/' : provides an object containing all users**
- post on '/signup', '/login', '/logout' : to signup a new user, to login an existing user, to logout a user
- post on '/facebook/token' : login using Facebook ( Third Party Login )

# /dishes
- get on '/' : returns all the dishes
- post on '/' : adds a new dish**
- delete on '/' : deletes all dishes**
- get on '/:dishId' : returns a dish
- put on '/:dishId' : edits an existing dish**
- delete on '/:dishId' : deletes a single dish**
 
 # /leaders
 *same as /dishes but for leaders data*
 
 # /promotions
 *same as /dishes but for promotions data*
 
 # /favorites
 - get on '/' : get all the favorite dishes of a user*
 - post on '/' : add dishes to favorites of a user*
 - delete on '/' : deletes dishes from favorites of a user*
 - get on '/:dishId' : return true if a dish is in favorites for user*
 - post on '/:dishId' : adds a dish to the favorites of a user*
 - delete on '/:dishId' : deletes a dish to the favorites of a user*
 
 # /comments
 - get on '/' : gets all the comments on a specific dish*
 - post on '/' : adds a comment on a specific dish*
 - delete on '/' : delete all the comments on a dish**
 - get on '/commentId' : gets a specific comment
 - put on '/commentId' : edits a specific comment*
 - delete on '/commentId' : deletes a specific comment*
 
 # /imageUpload
 - post on '/' : uploads an image on server-side( Mongo )
 
 ## PS: 
 * user must be login
 ** admin must be login
 
 ## Closing
 All this data is hosted through a json-server for the react-application ( rConFusion ) to work as a standalone app.
