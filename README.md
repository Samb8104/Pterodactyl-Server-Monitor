# Pterodactyl-Server-Monitor

## Prerequisites
- Node.js >= 10.X
- SQL Server running with a user with access to the database used 
- npm

Please note: Pterodactyl server monitor has currently been tested on:
- Ubuntu 16
- Ubuntu 18

## Installation
1. In config.json fill in the required pterodactyl details (panel URL, admin API key, client API key)
2. Next fill out the MySQL details and the database you are using
3. Under the web property you can change the port you want the webserver to run on
4. Change the displayName to what you want the title of the page to be
5. Finally run `npm run setup`

## Adding servers to the config
1. For each server you want to add, create an object in the config
2. The minimum you need for a server to be displayed is its pterodactyl id, which you can add with the property `id: "myid"`
3. If you wish to override the description that is fetched from pterodactyl, set the decription property to a message of your choosing `description: "mydesc"`
4. To enable server querying to get information such as players and server version simply add the property `queryInfo: true` and set it to true
5. Querying also requires you to have 2 additional settings which is the `queryAddress: "xxx.xxx.xxx.xxx"` and `queryPort: "xxxxx"` which should both my self explanatory
6. The final step is to make sure querying is enabled on the server you wish to query

To start the application once everything is setup, please run `npm start`
For support, join my [discord](https://discord.gg/F63Kafe)

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
