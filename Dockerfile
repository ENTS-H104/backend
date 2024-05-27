# Use a specific version of Node.js as the base image
FROM node:18.20.0

# Set the working directory in the container
WORKDIR /app

# Copy the rest of the application code
COPY . .

# Install dependencies
RUN npm install

# Command to run the application
CMD ["npm", "run", "start"]