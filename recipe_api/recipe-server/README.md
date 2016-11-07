#CS-554 HW2
##Workers and APIs
Your assignment is to expand the lecture 5 code (Links to an external site.) by expanding the API. Your API will offload work to a worker role.

You will first implement a second set of routes to support users. The routes are detailed below. You will authenticate users using token based authentication; the user token will be provided in a header titled Auth-Token: THETOKEN

#Routes to add
##User Routes

POST	/users	
Posting to this route must allow for the creation of a user. Making a new user updates the location in redis that you are using to cache your list of users; whether this is a set, a hash, or a JSON string is up to you. You should also cache the entire user in redis so that they are cached by their ID.

POST	/users/session	
Posting your username and password to this route must create a new session for the user with the credentials provided and respond with the authentication token that will associate the user to the token. The token returned will be the value provided to the server in the Auth-Token header

GET	/users/:id	
Must provide public facing info about the user; no sensitive data must be displayed; results will be cached for 5 minutes. You can cache using the express-redis-cache package or you may cache the data yourself.

GET	/users	
Provides public facing info about all users; results will be cached for 10 minutes. You can cache using the express-redis-cache package or you may cache the data yourself.

PUT	/users	
PUTing to this route must update the current user; note, you'll have to be authenticated to do this! If a cache entry exists for this user, it must be updated and exist for 5 minutes before expiring (basically, reset the cache time)

DELETE	/users	
Will delete your user based on the Auth-token provided and invalidate session; If a cache entry exists for this user, it will be removed.

##Recipe Routes

POST	/recipes	
Modify this route to add some association between the user and the recipe; you can only make recipes while logged in; the new recipe will be cached for 1 hour; the recipe list cache entry will be updated if it exists

GET	/recipes/:id	
Provide data about the recipe and the creator; if the user is logged in, a session object will be updated to add the recipe to a set of the last 10 recipes viewed. You can cache using the express-redis-cache package or you may cache the data yourself.

GET	/recipes	
Provide the id, title, creator, and creator ID of each recipe; the result should be cached for 1 hour. You can cache using the express-redis-cache package or you may cache the data yourself.

PUT	/recipes/:id	
Will allow you to update a recipe; only the creator of a recipe may update it; you must be authenticated to use this route; cache entries for that recipe must be updated

DELETE	/recipes/:id	
Will allow you to delete a recipe; only the creator of a recipe may update it; you must be authenticated to use this route. If a cache entry exists for this recipe, it will be removed.
