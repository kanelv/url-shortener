# System Design URL Shortener
## 1. What is a URL Shortener
- a service creates an alias or a short URL for a long URL
- users are redirected to the original URL when they visit these short links

## 2. Requirement

### 2.1 Functional Requirement
- given a long URL, the service should generate a shorten and unique alias for it
- user will be redirect to the original link when hitting a short link
- link will expire after a standard default time span

### 2.2. Non-functional requirements
- High availability
- URL redirection should happen in real time with minimal latency
- Shortened links should not be predictable.
- The system should be scalable and efficient

### 2.3 Extended requirements
- prevent abuse of services
- record analytics and metric for re-directions

## 3. Estimation and Constraints

### 3.1 Traffic
This will be a read-heavy system, so let's assume a 100;1 read/write ratio with **100** million links generated per month

#### 3.1.1 Reads/Writes Per Month
- for reads/month: 100  x 100 million = 10 billion/month
- for writes/month: 1   x 100 million = 100 million/month

#### 3.1.2 Request per Second (RPS):
**100** million links generated per month translate into **40** requests per second.
- write requests : 100 million / (30 * 24 * 36000) = ~ 40 URLs/second
- with a 100:1 read/write ratio, the number of read requests or redirections request will be:
=> 100 x 40 URLs/second = 4000 requests/second

### 3.2 Bandwidth
- expecting about 40 URLs/second, let's assume each request is of size 500 bytes then 
=> total incoming data for then write requests would be:
  40 x 500 bytes = 20 KB/second
=> for the read requests:
  4000 x 500 bytes = ~ 2 MB/second

### 3.3 Storage:

#### 3.3.1 Length of Short URL
- we are using 10 characters to generate a short URL. 
These characters are a combination of 62 characters [A-Z, a-z, 0-9] something like 
http://url-shortener.com/url/2DPzYjN6Vh.

#### 3.3.2 Data Capacity Modeling
- discuss the data capacity model to estimate teh storage of the system.
- Let’s make the assumption given below for different attributes… 
  + consider the average originalURL size of 2KB for 2048 character
  + urlCode: 10 bytes for 10 characters
  + created_at: timestamp: 8 bytes,
  + expiration_length_in_minutes: timestamp: 8 bytes
=> 2.0254KB per shortened URL entry in the database.
refs: https://www.postgresql.org/docs/current/datatype-datetime.html

### 3.3.3 Calculate storage
Assuming, we store each link or record in our databases for 5 years. Since we expect around **100M** new URL shortenings per month
=> total number of records we need to stored would be
  100 million x 2KB = 200 million KB per month = ~ 190.73 GB per month
  => 1 years * 190.72 GB per month = 2.235 TB per year
  => 5 years x 2.235 TB per year = 11.175 TB

#### 3.3.4 Kind of database:
Since the data is not strongly relational, NoSQL databases will be a better choice here
refs: SQL and NoSQL comparison at the link below
https://www.karanpratapsingh.com/courses/system-design/sql-vs-nosql-databases
=> MongoDB or Cassandra

## References
https://dev.to/karanpratapsingh/system-design-url-shortener-10i5
https://www.geeksforgeeks.org/system-design-url-shortening-service/
https://www.digitalocean.com/community/tutorials/how-to-build-a-type-safe-url-shortener-in-nodejs-with-nestjs

# For UI Idea
https://www.shorturl.at/