# Step 1: Build the app
#FROM node:18-alpine AS build
#WORKDIR /app
#COPY . .
#RUN npm install
#RUN npm run build

# Step 2: Serve with Nginx
#FROM nginx:alpine
#COPY --from=build /app/dist /usr/share/nginx/html
#COPY nginx.conf /etc/nginx/conf.d/default.conf
#EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]

# Step 1: Build the Vite app
FROM node:18-alpine AS build

WORKDIR /app

# Copy files and install dependencies
COPY . .

# Set the API base URL dynamically at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm install
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

# Copy build output to Nginx's default public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config if you have one
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


