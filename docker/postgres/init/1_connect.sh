#!/bin/sh
psql --set ON_ERROR_STOP=on -U postgres -d url-shortener

# The uuid-ossp extension can be used to generate a UUID .
# psql --set ON_ERROR_STOP=on -U postgres -d url-shortener -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
