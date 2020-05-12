# Pterodactyl-Server-Monitor

## Prerequisites
- Node.js >= 10.X
- Python >= 2.7
- SQL Server running with a user with access to the database used 

## Installation
1. In config.json fill in the required pterodactyl details (panel URL, admin API key, client API key)
2. Next fill out the MySQL details and the database you are using
3. Add the IDs of all the servers you want to monitor in the servers list
4. Under the web property you can change the port you want the webserver to run on
5. Change the displayName to what you want the title of the page to be
6. Install dependancies with `npm i`

## Overriding descriptions
1. Enable description overriding in config.json
2. In the servers list, add the id of the server you want to override with the replacement being what you want the description to be replaced with

## Using a reverse proxy with NGINX (ubuntu)
1. Make sure nginx is installed
2. Create a new file in the /sites-available folder
3. Add the proxy virtual host config into this file:
```
server {
  listen 80;
  listen [::]:80;
  server_name {domain}; 
  location / {
    proxy_pass http://localhost:{port};
  }
}
```
4. Enable this virtualhost file by running: ln -s /etc/nginx/{filename} /etc/nginx/sites-enabled/
5. Restart nginx `service nginx restart`
