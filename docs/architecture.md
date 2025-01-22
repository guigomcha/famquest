# Implementation decisions

## Deployment

Directly over K8s in kind for practice.

## Language

### Frontend

Good opportunity to develop a bit of javascript. React JS seems to be the easiest

## Backends

- Golang for Basic DB interactions: Speed, clean, learn SQL
  - <https://blog.logrocket.com/building-simple-app-go-postgresql/>
  - <https://www.sqliz.com/posts/golang-gorm-postgresql/>
  - Admin UI <https://github.com/techwithgates/goadmin>?

- Python for more complex data processing

## Database

### Redis

Drawbacks:

- RAM memory is always more expensive than disk.
- The app is not concerned about real-time.
- Main storage will be relational data + multi-media which might not be ideal for redis

Decision:

- Could eventually be used as message broker and adopted for client side cache

### PostgreSQL

For relational data.

### Multi-media storage

I need an object storage in disk to optimize storage.

- <https://github.com/minio/minio>
- <https://ceph.io/en/discover/technology/>
- <https://www.tritondatacenter.com/triton/object-storage>

## Data models

Relational Db based on golang structs

## Workflows

Start

- Maps manager receives the map center, resolution and zoom, the user location is taken from DB:
  - Find out what resource Ids are needed to be available in the UI
  - Provide the location history to hide the rest of the locations

Refresh periodically (and at start):

- location sent to map manager periodically, map worker updates user location and history

Anytime:

- User clicks and Frontend talks directly to the Db manager

Open Profile:

- Load progress bars

Cronjobs:

- request location data to load user's history
